import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

// Obtener set de identificaciones con factura vigente (paginado)
async function getIdsConPlanVigente() {
  const today = new Date().toISOString().split('T')[0]
  const PAGE_SIZE = 1000
  const ids = new Set()
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('facturas')
      .select('identificacion_cliente')
      .gte('fecha_vencimiento', today)
      .eq('estado_anulada', false)
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    data.forEach(f => ids.add(f.identificacion_cliente))
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return ids
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sede = searchParams.get('sede')
    const plan = searchParams.get('plan') // 'con_plan' | 'sin_plan' | null
    const genero = searchParams.get('genero')
    const busqueda = searchParams.get('busqueda')
    const limit = parseInt(searchParams.get('limit') || '5000')

    // Siempre obtener IDs con plan vigente (necesario para enriquecer + filtro)
    let idsConPlan = await getIdsConPlanVigente()

    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })

    // No aplicar limit de Supabase si vamos a filtrar en JS por plan
    if (!plan) {
      query = query.limit(limit)
    }

    // Filtros en query
    if (sede) {
      query = query.eq('sucursal_codigo', sede)
    }
    if (genero) {
      query = query.eq('genero', genero)
    }
    if (busqueda) {
      // Búsqueda por nombre o identificación
      const { data: clientesBusqueda } = await supabase
        .from('clientes')
        .select('identificacion')
        .ilike('nombre_completo', `%${busqueda}%`)
      
      const ids = clientesBusqueda?.map(c => c.identificacion) || []
      if (ids.length > 0) {
        query = query.in('identificacion', ids)
      } else {
        // Si no hay resultados por nombre, buscar por ID exacto
        query = query.eq('identificacion', busqueda)
      }
    }

    const { data: clientes, error, count } = await query

    if (error) throw error

    // Filtrar por plan en JS (evita límites de Supabase con .in() para miles de IDs)
    let clientesFiltrados = clientes || []
    if (plan === 'con_plan') {
      clientesFiltrados = clientesFiltrados.filter(c => idsConPlan.has(String(c.identificacion)))
    } else if (plan === 'sin_plan') {
      clientesFiltrados = clientesFiltrados.filter(c => !idsConPlan.has(String(c.identificacion)))
    }

    // Aplicar limit después del filtro por plan
    if (plan) {
      clientesFiltrados = clientesFiltrados.slice(0, limit)
    }

    // Obtener facturas vigentes de los clientes en esta página para el nombre del plan
    const identificaciones = clientesFiltrados.map(c => c.identificacion)
    const today = new Date().toISOString().split('T')[0]
    const { data: facturasVigentes } = await supabase
      .from('facturas')
      .select('identificacion_cliente, fecha_vencimiento, id')
      .in('identificacion_cliente', identificaciones)
      .gte('fecha_vencimiento', today)
      .eq('estado_anulada', false)
      .order('fecha_vencimiento', { ascending: false })

    // Map: cliente -> id de su factura vigente más reciente
    const facturaMap = {}
    facturasVigentes?.forEach(f => {
      if (!facturaMap[f.identificacion_cliente]) {
        facturaMap[f.identificacion_cliente] = f.id
      }
    })

    // Obtener descripción del plan de esas facturas
    const facturaIds = [...new Set(Object.values(facturaMap))]
    let planMap = {}
    if (facturaIds.length > 0) {
      const { data: detalles } = await supabase
        .from('detalles_factura')
        .select('factura_id, descripcion')
        .in('factura_id', facturaIds)
        .eq('es_plan', true)

      detalles?.forEach(d => {
        if (!planMap[d.factura_id]) {
          planMap[d.factura_id] = d.descripcion
        }
      })
    }

    const clientesEnriquecidos = clientesFiltrados.map(c => ({
      ...c,
      estado_cliente: idsConPlan.has(String(c.identificacion))
        ? 'Con plan vigente'
        : 'Sin plan vigente',
      nombre_sucursal: getNombreSucursal(c.sucursal_codigo),
      plan_vigente: planMap[facturaMap[c.identificacion]] || null
    }))

    return NextResponse.json({
      total: clientesEnriquecidos.length,
      clientes: clientesEnriquecidos
    })

  } catch (error) {
    console.error('Error en /api/clientes:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

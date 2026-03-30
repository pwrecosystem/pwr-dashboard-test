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
    const estado = searchParams.get('estado')
    const estadoCliente = searchParams.get('estado_cliente')
    const busqueda = searchParams.get('busqueda')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Determinar si se filtra por plan vigente (requiere cruzar con facturas)
    const filtroPlan = estadoCliente === 'Con plan vigente' || estadoCliente === 'Sin plan vigente'
    let idsConPlan = null

    if (filtroPlan) {
      idsConPlan = await getIdsConPlanVigente()
    }

    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .limit(limit)

    // Filtros
    if (sede) {
      query = query.eq('sucursal_codigo', sede)
    }
    if (estado) {
      query = query.eq('estado', estado)
    }
    if (filtroPlan && idsConPlan) {
      const idsArray = [...idsConPlan]
      if (estadoCliente === 'Con plan vigente') {
        query = query.in('identificacion', idsArray)
      } else {
        // Sin plan: excluir los que tienen plan vigente
        query = query.not('identificacion', 'in', `(${idsArray.join(',')})`)
      }
    } else if (estadoCliente) {
      // Fallback para otros valores de estado_cliente
      query = query.eq('estado_cliente', estadoCliente)
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

    // Enriquecer cada cliente con su estado real basado en facturas
    if (!idsConPlan) {
      idsConPlan = await getIdsConPlanVigente()
    }

    // Obtener facturas vigentes de los clientes en esta página para el nombre del plan
    const identificaciones = clientes?.map(c => c.identificacion) || []
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

    const clientesEnriquecidos = clientes?.map(c => ({
      ...c,
      estado_cliente: idsConPlan.has(String(c.identificacion))
        ? 'Con plan vigente'
        : 'Sin plan vigente',
      nombre_sucursal: getNombreSucursal(c.sucursal_codigo),
      plan_vigente: planMap[facturaMap[c.identificacion]] || null
    })) || []

    return NextResponse.json({
      total: count || clientesEnriquecidos.length,
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

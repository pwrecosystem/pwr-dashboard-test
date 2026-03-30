import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// Helper: obtener set de identificaciones con factura vigente (paginado)
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
    const estado = searchParams.get('estado') || 'vigentes'
    const sede = searchParams.get('sede')

    const today = new Date().toISOString().split('T')[0]

    // Obtener cortesías
    let query = supabase
      .from('cortesias')
      .select('identificacion_cliente, nombre_cliente, nombre_plan, fecha_compra, fecha_vencimiento, sucursal_codigo, nombre_sucursal_vende, usuario, tiquetes_entrada, tiquetes_dias_restantes, estado_anulada')
      .eq('estado_anulada', false)

    if (estado === 'vigentes' || estado === 'sin_plan') {
      query = query.gte('fecha_vencimiento', today)
    }

    if (sede) {
      query = query.eq('sucursal_codigo', sede)
    }

    query = query.order('fecha_vencimiento', { ascending: true })

    const { data: cortesias, error: cortesiasError } = await query
    if (cortesiasError) throw cortesiasError

    if (!cortesias || cortesias.length === 0) {
      return NextResponse.json({
        totales: { cortesias: 0, clientesUnicos: 0, sinPlan: 0, conPlan: 0, sinCheckIn: 0 },
        detalle: []
      })
    }

    // Obtener IDs con plan vigente
    const idsConPlan = await getIdsConPlanVigente()

    // Check-ins: contar ingresos por cliente
    const clienteIds = [...new Set(cortesias.map(c => c.identificacion_cliente))]

    const { data: ingresos, error: ingresosError } = await supabase
      .from('ingresos')
      .select('identificacion')
      .in('identificacion', clienteIds)

    if (ingresosError) throw ingresosError

    const checkInsMap = {}
    ingresos?.forEach(i => {
      checkInsMap[i.identificacion] = (checkInsMap[i.identificacion] || 0) + 1
    })

    // Enriquecer cada cortesía
    let detalle = cortesias.map(c => {
      const fechaVenc = new Date(c.fecha_vencimiento)
      const fechaHoy = new Date(today)
      const diasRestantes = Math.ceil((fechaVenc - fechaHoy) / (1000 * 60 * 60 * 24))
      const tiene_plan = idsConPlan.has(c.identificacion_cliente)
      const check_ins = checkInsMap[c.identificacion_cliente] || 0

      return {
        identificacion_cliente: c.identificacion_cliente,
        nombre_cliente: c.nombre_cliente,
        nombre_plan: c.nombre_plan,
        fecha_compra: c.fecha_compra,
        fecha_vencimiento: c.fecha_vencimiento,
        nombre_sucursal: c.nombre_sucursal_vende,
        sucursal_codigo: c.sucursal_codigo,
        vendedor: c.usuario,
        tiene_plan,
        check_ins,
        dias_restantes: diasRestantes
      }
    })

    // Filtrar si estado=sin_plan
    if (estado === 'sin_plan') {
      detalle = detalle.filter(c => !c.tiene_plan)
    }

    // Totales (sobre vigentes, no filtrado por sin_plan)
    const detalleVigentes = estado === 'sin_plan'
      ? cortesias.map(c => ({ tiene_plan: idsConPlan.has(c.identificacion_cliente), check_ins: checkInsMap[c.identificacion_cliente] || 0 }))
      : detalle

    const clientesUnicos = new Set(detalle.map(c => c.identificacion_cliente)).size
    const sinPlan = detalle.filter(c => !c.tiene_plan).length
    const conPlan = detalle.filter(c => c.tiene_plan).length
    const sinCheckIn = detalle.filter(c => c.check_ins === 0).length

    return NextResponse.json({
      totales: {
        cortesias: detalle.length,
        clientesUnicos,
        sinPlan,
        conPlan,
        sinCheckIn
      },
      detalle
    })

  } catch (error) {
    console.error('Error en /api/cortesias:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal, categorizarServicio } from '../../../lib/constants'

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

export async function GET() {
  try {
    // ── Clientes: conteo total (count-only, no descarga datos)
    const { count: total, error: totalError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
    if (totalError) throw totalError

    // Activos
    const { count: activos, error: activosError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'ACTIVO')
    if (activosError) throw activosError

    // Con plan / sin plan — fuente de verdad: facturas vigentes
    const idsConPlan = await getIdsConPlanVigente()
    const conPlan = idsConPlan.size
    const sinPlan = (total || 0) - conPlan

    // ── Planes por vencer (próximos 7 días)
    const today = new Date().toISOString().split('T')[0]
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: facturasVencer, error: vencimientosError } = await supabase
      .from('facturas')
      .select('identificacion_cliente, fecha_vencimiento')
      .gte('fecha_vencimiento', today)
      .lte('fecha_vencimiento', in7Days)
      .eq('estado_anulada', false)
    if (vencimientosError) throw vencimientosError

    // Filtrar: excluir clientes que ya tienen una factura con vencimiento posterior
    let porVencer7Dias = 0
    if (facturasVencer && facturasVencer.length > 0) {
      const clientesIdsVencer = [...new Set(facturasVencer.map(f => f.identificacion_cliente))]
      const { data: facturasRecientesVencer } = await supabase
        .from('facturas')
        .select('identificacion_cliente, fecha_vencimiento')
        .in('identificacion_cliente', clientesIdsVencer)
        .eq('estado_anulada', false)
        .order('fecha_vencimiento', { ascending: false })

      const maxVencimientoVencer = {}
      facturasRecientesVencer?.forEach(f => {
        if (!maxVencimientoVencer[f.identificacion_cliente] || f.fecha_vencimiento > maxVencimientoVencer[f.identificacion_cliente]) {
          maxVencimientoVencer[f.identificacion_cliente] = f.fecha_vencimiento
        }
      })

      porVencer7Dias = facturasVencer.filter(f =>
        maxVencimientoVencer[f.identificacion_cliente] === f.fecha_vencimiento
      ).length
    }

    // ── Ingresos del mes actual (usando facturas, no la tabla ingresos que es log de acceso)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: facturasActual, error: facturasError } = await supabase
      .from('facturas')
      .select('total')
      .gte('fecha_compra', startOfMonth)
      .lte('fecha_compra', endOfMonth)
      .eq('estado_anulada', false)
    if (facturasError) throw facturasError

    const ingresoMes = facturasActual?.reduce((acc, f) => acc + (f.total || 0), 0) || 0

    // ── Ingresos mes anterior
    const prevMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]
    const prevMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]

    const { data: facturasPrev, error: facturasPrevError } = await supabase
      .from('facturas')
      .select('total')
      .gte('fecha_compra', prevMonthStart)
      .lte('fecha_compra', prevMonthEnd)
      .eq('estado_anulada', false)
    if (facturasPrevError) throw facturasPrevError

    const ingresoMesAnterior = facturasPrev?.reduce((acc, f) => acc + (f.total || 0), 0) || 0
    const variacion = ingresoMesAnterior > 0
      ? ((ingresoMes - ingresoMesAnterior) / ingresoMesAnterior * 100).toFixed(1)
      : 0

    // ── Clientes por sucursal (solo el campo necesario)
    const { data: sucursalesData, error: sucursalesError } = await supabase
      .from('clientes')
      .select('sucursal_codigo')
    if (sucursalesError) throw sucursalesError

    const sucursalesCount = {}
    sucursalesData?.forEach(c => {
      const sede = String(c.sucursal_codigo || 'Sin sede')
      sucursalesCount[sede] = (sucursalesCount[sede] || 0) + 1
    })

    const sucursales = Object.entries(sucursalesCount).map(([codigo, clientesCount]) => ({
      codigo,
      nombre: getNombreSucursal(codigo),
      clientes: clientesCount
    }))

    // ── Wellness Amsterdam (sede 15, total histórico)
    const { data: detallesWellness } = await supabase
      .from('detalles_factura')
      .select('descripcion, total, no_factura')
      .eq('sucursal_codigo', 15)

    const wellnessTotal = detallesWellness
      ?.filter(d => categorizarServicio(d.descripcion) === 'Wellness')
      ?.reduce((acc, d) => acc + (d.total || 0), 0) || 0

    return NextResponse.json({
      clientes: {
        total: total || 0,
        activos: activos || 0,
        sinPlan: sinPlan || 0,
        conPlan: conPlan || 0,
        porVencer7Dias: porVencer7Dias || 0
      },
      ingresos: {
        mesActual: ingresoMes,
        mesAnterior: ingresoMesAnterior,
        variacion: parseFloat(variacion)
      },
      sucursales,
      wellness: {
        ingresoTotal: wellnessTotal,
      }
    })

  } catch (error) {
    console.error('Error en /api/dashboard:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

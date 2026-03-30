import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET() {
  try {
    // Clientes totales y por estado
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('estado, estado_cliente')

    if (clientesError) throw clientesError

    const total = clientes?.length || 0
    const activos = clientes?.filter(c => c.estado === 'ACTIVO').length || 0
    const sinPlan = clientes?.filter(c => c.estado_cliente === 'Sin plan vigente').length || 0
    const conPlan = clientes?.filter(c => c.estado_cliente === 'Con plan vigente').length || 0

    // Planes por vencer (próximos 7 días)
    const today = new Date().toISOString().split('T')[0]
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: vencimientos, error: vencimientosError } = await supabase
      .from('facturas')
      .select('id, fecha_vencimiento, total')
      .gte('fecha_vencimiento', today)
      .lte('fecha_vencimiento', in7Days)
      .eq('estado_anulada', false)

    if (vencimientosError) throw vencimientosError
    const porVencer7Dias = vencimientos?.length || 0

    // Ingresos del mes actual
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: ingresos, error: ingresosError } = await supabase
      .from('ingresos')
      .select('valor')
      .gte('fecha', startOfMonth)
      .lte('fecha', endOfMonth)

    if (ingresosError) throw ingresosError
    const ingresoMes = ingresos?.reduce((acc, i) => acc + (i.valor || 0), 0) || 0

    // Ingresos mes anterior para comparación
    const prevMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]
    const prevMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]

    const { data: ingresosPrev, error: ingresosPrevError } = await supabase
      .from('ingresos')
      .select('valor')
      .gte('fecha', prevMonthStart)
      .lte('fecha', prevMonthEnd)

    if (ingresosPrevError) throw ingresosPrevError
    const ingresoMesAnterior = ingresosPrev?.reduce((acc, i) => acc + (i.valor || 0), 0) || 0
    const variacion = ingresoMesAnterior > 0 
      ? ((ingresoMes - ingresoMesAnterior) / ingresoMesAnterior * 100).toFixed(1)
      : 0

    // Sucursales
    const { data: sucursalesData, error: sucursalesError } = await supabase
      .from('clientes')
      .select('sucursal')

    if (sucursalesError) throw sucursalesError

    const sucursalesCount = {}
    sucursalesData?.forEach(c => {
      const sede = c.sucursal || 'Sin sede'
      sucursalesCount[sede] = (sucursalesCount[sede] || 0) + 1
    })

    const sucursales = Object.entries(sucursalesCount).map(([codigo, clientes]) => ({
      codigo,
      nombre: codigo === '1' ? 'Poblado' : codigo === '2' ? 'Amsterdam' : codigo === '3' ? 'Saboleta' : `Sede ${codigo}`,
      clientes
    }))

    return NextResponse.json({
      clientes: {
        total,
        activos,
        sinPlan,
        conPlan,
        porVencer7Dias
      },
      ingresos: {
        mesActual: ingresoMes,
        mesAnterior: ingresoMesAnterior,
        variacion: parseFloat(variacion)
      },
      sucursales
    })

  } catch (error) {
    console.error('Error en /api/dashboard:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

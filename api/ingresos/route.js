import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const sede = searchParams.get('sede')

    // Por defecto, último mes
    const today = new Date()
    const defaultDesde = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const defaultHasta = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

    const fechaDesde = desde || defaultDesde
    const fechaHasta = hasta || defaultHasta

    let query = supabase
      .from('ingresos')
      .select('*')
      .gte('fecha', fechaDesde)
      .lte('fecha', fechaHasta)

    if (sede) {
      query = query.eq('sucursal', sede)
    }

    const { data: ingresos, error } = await query

    if (error) throw error

    // Total general
    const total = ingresos?.reduce((acc, i) => acc + (i.valor || 0), 0) || 0

    // Agrupar por día
    const porDiaMap = {}
    ingresos?.forEach(i => {
      const fecha = i.fecha?.split('T')[0]
      if (fecha) {
        porDiaMap[fecha] = (porDiaMap[fecha] || 0) + (i.valor || 0)
      }
    })
    const porDia = Object.entries(porDiaMap)
      .map(([fecha, valor]) => ({ fecha, valor }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    // Agrupar por sucursal
    const porSucursalMap = {}
    ingresos?.forEach(i => {
      const suc = i.sucursal || 'Sin sede'
      porSucursalMap[suc] = (porSucursalMap[suc] || 0) + (i.valor || 0)
    })
    const porSucursal = Object.entries(porSucursalMap).map(([sucursal, valor]) => ({
      sucursal,
      nombre: sucursal === '1' ? 'Poblado' : sucursal === '2' ? 'Amsterdam' : sucursal === '3' ? 'Saboleta' : `Sede ${sucursal}`,
      valor
    }))

    // Top vendedores
    const porVendedorMap = {}
    ingresos?.forEach(i => {
      const vendedor = i.vendedor || 'Sin vendedor'
      if (!porVendedorMap[vendedor]) {
        porVendedorMap[vendedor] = { valor: 0, ventas: 0 }
      }
      porVendedorMap[vendedor].valor += (i.valor || 0)
      porVendedorMap[vendedor].ventas += 1
    })
    const topVendedores = Object.entries(porVendedorMap)
      .map(([vendedor, data]) => ({ vendedor, ...data }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10)

    return NextResponse.json({
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      total,
      porDia,
      porSucursal,
      topVendedores
    })

  } catch (error) {
    console.error('Error en /api/ingresos:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

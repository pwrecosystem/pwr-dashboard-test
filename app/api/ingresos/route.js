import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

// NOTA: Los ingresos financieros provienen de la tabla `facturas`.
// La tabla `ingresos` en Supabase es un log de acceso al gimnasio (entradas/salidas),
// no contiene datos de ventas ni valores monetarios.

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const sede = searchParams.get('sede')

    // Por defecto, mes actual
    const today = new Date()
    const defaultDesde = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const defaultHasta = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

    const fechaDesde = desde || defaultDesde
    const fechaHasta = hasta || defaultHasta

    // Consultar facturas no anuladas en el período
    let query = supabase
      .from('facturas')
      .select('total, fecha_compra, sucursal_codigo, comercial')
      .gte('fecha_compra', fechaDesde)
      .lte('fecha_compra', fechaHasta)
      .eq('estado_anulada', false)

    if (sede) {
      query = query.eq('sucursal_codigo', sede)
    }

    const { data: facturas, error } = await query
    if (error) throw error

    // Total general
    const total = facturas?.reduce((acc, f) => acc + (f.total || 0), 0) || 0

    // Agrupar por día
    const porDiaMap = {}
    facturas?.forEach(f => {
      const fecha = f.fecha_compra?.split('T')[0]
      if (fecha) {
        porDiaMap[fecha] = (porDiaMap[fecha] || 0) + (f.total || 0)
      }
    })
    const porDia = Object.entries(porDiaMap)
      .map(([fecha, valor]) => ({ fecha, valor }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    // Agrupar por sucursal
    const porSucursalMap = {}
    facturas?.forEach(f => {
      const suc = String(f.sucursal_codigo || 'Sin sede')
      porSucursalMap[suc] = (porSucursalMap[suc] || 0) + (f.total || 0)
    })
    const porSucursal = Object.entries(porSucursalMap).map(([sucursal, valor]) => ({
      sucursal,
      nombre: getNombreSucursal(sucursal),
      valor
    }))

    // Top vendedores (comercial en facturas)
    const porVendedorMap = {}
    facturas?.forEach(f => {
      const vendedor = f.comercial || 'Sin vendedor'
      if (!porVendedorMap[vendedor]) {
        porVendedorMap[vendedor] = { valor: 0, ventas: 0 }
      }
      porVendedorMap[vendedor].valor += (f.total || 0)
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

import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

export async function GET() {
  try {
    // Obtener clientes por sucursal (campo correcto: sucursal_codigo)
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('sucursal_codigo, estado')
    if (clientesError) throw clientesError

    // Obtener ingresos por sucursal (mes actual) desde facturas
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: facturas, error: facturasError } = await supabase
      .from('facturas')
      .select('sucursal_codigo, total')
      .gte('fecha_compra', startOfMonth)
      .lte('fecha_compra', endOfMonth)
      .eq('estado_anulada', false)
    if (facturasError) throw facturasError

    // Agrupar datos
    const sucursalesData = {}

    clientes?.forEach(c => {
      const suc = String(c.sucursal_codigo || '0')
      if (!sucursalesData[suc]) {
        sucursalesData[suc] = {
          codigo: suc,
          nombre: getNombreSucursal(suc),
          clientes: 0,
          clientesActivos: 0,
          ingresos: 0
        }
      }
      sucursalesData[suc].clientes += 1
      if (c.estado === 'ACTIVO') {
        sucursalesData[suc].clientesActivos += 1
      }
    })

    facturas?.forEach(f => {
      const suc = String(f.sucursal_codigo || '0')
      if (!sucursalesData[suc]) {
        sucursalesData[suc] = {
          codigo: suc,
          nombre: getNombreSucursal(suc),
          clientes: 0,
          clientesActivos: 0,
          ingresos: 0
        }
      }
      sucursalesData[suc].ingresos += (f.total || 0)
    })

    const sucursales = Object.values(sucursalesData).sort((a, b) => 
      parseInt(a.codigo) - parseInt(b.codigo)
    )

    return NextResponse.json({ sucursales })

  } catch (error) {
    console.error('Error en /api/sucursales:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

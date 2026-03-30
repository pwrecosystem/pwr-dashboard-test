import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET() {
  try {
    // Obtener clientes por sucursal
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('sucursal, estado')

    if (clientesError) throw clientesError

    // Obtener ingresos por sucursal (mes actual)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: ingresos, error: ingresosError } = await supabase
      .from('ingresos')
      .select('sucursal, valor')
      .gte('fecha', startOfMonth)
      .lte('fecha', endOfMonth)

    if (ingresosError) throw ingresosError

    // Agrupar datos
    const sucursalesData = {}

    clientes?.forEach(c => {
      const suc = c.sucursal || '0'
      if (!sucursalesData[suc]) {
        sucursalesData[suc] = {
          codigo: suc,
          nombre: suc === '1' ? 'Poblado' : suc === '2' ? 'Amsterdam' : suc === '3' ? 'Saboleta' : `Sede ${suc}`,
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

    ingresos?.forEach(i => {
      const suc = i.sucursal || '0'
      if (sucursalesData[suc]) {
        sucursalesData[suc].ingresos += (i.valor || 0)
      }
    })

    const sucursales = Object.values(sucursalesData).sort((a, b) => a.codigo.localeCompare(b.codigo))

    return NextResponse.json({ sucursales })

  } catch (error) {
    console.error('Error en /api/sucursales:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

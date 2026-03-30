import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal, categorizarServicio } from '../../../lib/constants'

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

export async function GET() {
  try {
    // Obtener clientes por sucursal (campo correcto: sucursal_codigo)
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('sucursal_codigo, estado, identificacion')
    if (clientesError) throw clientesError

    // Obtener IDs con plan vigente (fuente de verdad: facturas)
    const idsConPlan = await getIdsConPlanVigente()

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
          clientesConPlan: 0,
          ingresos: 0
        }
      }
      sucursalesData[suc].clientes += 1
      if (c.estado === 'ACTIVO') {
        sucursalesData[suc].clientesActivos += 1
      }
      if (idsConPlan.has(String(c.identificacion))) {
        sucursalesData[suc].clientesConPlan += 1
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

    // Desglose Amsterdam (sede 15)
    const { data: detallesAmsterdam } = await supabase
      .from('detalles_factura')
      .select('descripcion, total')
      .eq('sucursal_codigo', 15)

    const desglose = { Wellness: 0, Nutrición: 0, Training: 0, Box: 0, Eventos: 0, Yoga: 0 }
    detallesAmsterdam?.forEach(d => {
      const cat = categorizarServicio(d.descripcion)
      if (desglose[cat] !== undefined) {
        desglose[cat] += (d.total || 0)
      } else {
        desglose[cat] = (d.total || 0)
      }
    })

    const amsterdam = sucursales.find(s => s.codigo === '15')
    if (amsterdam) {
      amsterdam.desglose = desglose
    }

    return NextResponse.json({ sucursales })

  } catch (error) {
    console.error('Error en /api/sucursales:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

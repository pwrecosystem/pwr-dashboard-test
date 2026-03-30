import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal, categorizarServicio } from '../../../lib/constants'

export async function GET() {
  try {
    // Stats por sucursal via RPC
    const { data: sucursalesRaw, error } = await supabase.rpc('get_sucursales_stats')
    if (error) throw error

    const sucursales = (sucursalesRaw || []).map(s => ({
      ...s,
      nombre: getNombreSucursal(s.codigo)
    })).sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo))

    // Desglose Amsterdam (sede 15) — query directa a detalles_factura
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

    const amsterdam = sucursales.find(s => String(s.codigo) === '15')
    if (amsterdam) {
      amsterdam.desglose = desglose
    }

    return NextResponse.json({ sucursales })
  } catch (error) {
    console.error('Error en /api/sucursales:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

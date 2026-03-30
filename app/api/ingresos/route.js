import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde') || null
    const hasta = searchParams.get('hasta') || null
    const sede = searchParams.get('sede') ? parseInt(searchParams.get('sede')) : null

    const { data, error } = await supabase.rpc('get_ingresos_financieros', {
      p_desde: desde, p_hasta: hasta, p_sede: sede
    })
    if (error) throw error

    // Enriquecer sucursales con nombre
    const porSucursal = (data.porSucursal || []).map(s => ({
      ...s,
      nombre: getNombreSucursal(s.sucursal)
    }))

    return NextResponse.json({ ...data, porSucursal })
  } catch (error) {
    console.error('Error en /api/ingresos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

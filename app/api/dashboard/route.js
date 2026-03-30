import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    if (error) throw error

    // Sucursales stats con nombres
    const { data: sucursales, error: sucError } = await supabase.rpc('get_sucursales_stats')
    if (sucError) throw sucError

    const sucursalesConNombre = (sucursales || []).map(s => ({
      ...s,
      nombre: getNombreSucursal(s.codigo)
    }))

    return NextResponse.json({
      ...data,
      sucursales: sucursalesConNombre
    })
  } catch (error) {
    console.error('Error en /api/dashboard:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

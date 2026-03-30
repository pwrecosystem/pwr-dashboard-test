import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const dias = parseInt(searchParams.get('dias') || '7')
    const sede = searchParams.get('sede') ? parseInt(searchParams.get('sede')) : null
    const busqueda = searchParams.get('busqueda') || null

    const { data, error } = await supabase.rpc('get_vencimientos', {
      p_dias: dias, p_sede: sede, p_busqueda: busqueda
    })
    if (error) throw error

    // Enriquecer con nombre de sucursal
    const detalle = (data.detalle || []).map(d => ({
      ...d,
      nombre_sucursal: getNombreSucursal(d.sucursal_codigo)
    }))

    return NextResponse.json({ ...data, detalle })
  } catch (error) {
    console.error('Error en /api/vencimientos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

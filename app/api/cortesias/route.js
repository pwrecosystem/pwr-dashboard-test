import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || 'vigentes'
    const sede = searchParams.get('sede') ? parseInt(searchParams.get('sede')) : null

    const { data, error } = await supabase.rpc('get_cortesias', {
      p_estado: estado, p_sede: sede
    })
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en /api/cortesias:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

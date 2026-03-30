import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sede = searchParams.get('sede') ? parseInt(searchParams.get('sede')) : null
    const plan = searchParams.get('plan') || null
    const genero = searchParams.get('genero') || null
    const busqueda = searchParams.get('busqueda') || null
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error } = await supabase.rpc('get_clientes', {
      p_sede: sede,
      p_plan: plan,
      p_genero: genero,
      p_busqueda: busqueda,
      p_limit: limit,
      p_offset: offset
    })
    if (error) throw error

    // Enriquecer con nombre de sucursal
    const clientes = (data.clientes || []).map(c => ({
      ...c,
      nombre_sucursal: getNombreSucursal(c.sucursal_codigo),
      estado_cliente: c.estado_plan
    }))

    return NextResponse.json({ total: data.total, clientes })
  } catch (error) {
    console.error('Error en /api/clientes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

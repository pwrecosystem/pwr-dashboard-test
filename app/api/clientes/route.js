import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sede = searchParams.get('sede')
    const estado = searchParams.get('estado')
    const estadoCliente = searchParams.get('estado_cliente')
    const busqueda = searchParams.get('busqueda')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .limit(limit)

    // Filtros
    if (sede) {
      query = query.eq('sucursal_codigo', sede)  // campo correcto: sucursal_codigo
    }
    if (estado) {
      query = query.eq('estado', estado)
    }
    if (estadoCliente) {
      query = query.eq('estado_cliente', estadoCliente)
    }
    if (busqueda) {
      // Búsqueda por nombre o identificación
      const { data: clientesBusqueda } = await supabase
        .from('clientes')
        .select('identificacion')
        .ilike('nombre_completo', `%${busqueda}%`)
      
      const ids = clientesBusqueda?.map(c => c.identificacion) || []
      if (ids.length > 0) {
        query = query.in('identificacion', ids)
      } else {
        // Si no hay resultados por nombre, buscar por ID exacto
        query = query.eq('identificacion', busqueda)
      }
    }

    const { data: clientes, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      total: count || clientes?.length || 0,
      clientes: clientes || []
    })

  } catch (error) {
    console.error('Error en /api/clientes:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

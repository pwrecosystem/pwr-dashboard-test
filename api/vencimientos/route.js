import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const dias = parseInt(searchParams.get('dias') || '7')
    const sede = searchParams.get('sede')

    const today = new Date().toISOString().split('T')[0]
    const inDays = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let query = supabase
      .from('facturas')
      .select('id, identificacion_cliente, nombre_cliente, fecha_vencimiento, total, sucursal_codigo, estado_anulada')
      .gte('fecha_vencimiento', today)
      .lte('fecha_vencimiento', inDays)
      .eq('estado_anulada', false)
      .order('fecha_vencimiento', { ascending: true })

    if (sede) {
      query = query.eq('sucursal_codigo', sede)
    }

    const { data: facturas, error: facturasError } = await query

    if (facturasError) throw facturasError

    // Obtener datos de contacto de los clientes
    const clientesIds = [...new Set(facturas.map(f => f.identificacion_cliente))]
    
    let clientesMap = {}
    if (clientesIds.length > 0) {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('identificacion, nombre_completo, celular, correo_electronico')
        .in('identificacion', clientesIds)

      clientes?.forEach(c => {
        clientesMap[c.identificacion] = c
      })
    }

    // Calcular días restantes y enriquecer datos
    const detalle = facturas.map(f => {
      const fechaVenc = new Date(f.fecha_vencimiento)
      const hoy = new Date()
      const diffTime = fechaVenc - hoy
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const cliente = clientesMap[f.identificacion_cliente] || {}

      return {
        ...f,
        celular: cliente.celular || '',
        correo: cliente.correo_electronico || '',
        nombre_completo: cliente.nombre_completo || f.nombre_cliente,
        diasRestantes
      }
    })

    const total = detalle.reduce((acc, f) => acc + (f.total || 0), 0)

    return NextResponse.json({
      periodo: {
        inicio: today,
        fin: inDays,
        dias
      },
      totales: {
        cantidad: detalle.length,
        valor: total
      },
      detalle
    })

  } catch (error) {
    console.error('Error en /api/vencimientos:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

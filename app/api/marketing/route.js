import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // ── Segmentos principales via RPC ──
    const { data: segments, error } = await supabase.rpc('get_marketing_segments')
    if (error) throw error

    // Enriquecer con nombres de sucursal
    const enrichSede = (items) => (items || []).map(item => ({
      ...item,
      sede: item.sede || getNombreSucursal(item.sucursal_codigo)
    }))

    const inactivos = {
      total: segments.inactivos?.total || 0,
      detalle: enrichSede(segments.inactivos?.detalle)
    }

    const preRenovacion = {
      total: segments.pre_renovacion?.total || 0,
      detalle: enrichSede(segments.pre_renovacion?.detalle)
    }

    const fantasmas = {
      total: segments.fantasmas?.total || 0,
      detalle: enrichSede(segments.fantasmas?.detalle)
    }

    // ── Cortesías sin convertir — query directa (mantener lógica existente) ──
    // IDs con plan vigente (del segmento de inactivos podemos inferir, pero
    // para cortesías necesitamos el set completo — usamos facturas directamente)
    const PAGE_SIZE = 1000
    const idsConPlan = new Set()
    let offset = 0
    while (true) {
      const { data: fData, error: fErr } = await supabase
        .from('facturas')
        .select('identificacion_cliente')
        .gte('fecha_vencimiento', today)
        .eq('estado_anulada', false)
        .range(offset, offset + PAGE_SIZE - 1)
      if (fErr) throw fErr
      if (!fData || fData.length === 0) break
      fData.forEach(f => idsConPlan.add(f.identificacion_cliente))
      if (fData.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    // Cortesías vigentes
    const { data: cortesias } = await supabase
      .from('cortesias')
      .select('identificacion_cliente, nombre_cliente, nombre_plan, sucursal_codigo, nombre_sucursal_vende, tiquetes_entrada')
      .eq('estado_anulada', false)
      .gte('fecha_vencimiento', today)

    // Dedup por cliente
    const cortesiasUnico = {}
    cortesias?.forEach(c => {
      if (!cortesiasUnico[c.identificacion_cliente]) {
        cortesiasUnico[c.identificacion_cliente] = c
      }
    })

    const cortesiasSinConvertirAll = Object.values(cortesiasUnico)
      .filter(c => !idsConPlan.has(c.identificacion_cliente))

    // Check-ins de cortesías
    const cortesiasIds = cortesiasSinConvertirAll.map(c => c.identificacion_cliente)
    let checkInsMap = {}
    const BATCH = 500
    for (let i = 0; i < cortesiasIds.length; i += BATCH) {
      const batch = cortesiasIds.slice(i, i + BATCH)
      const { data: ingCortesias } = await supabase
        .from('ingresos')
        .select('identificacion')
        .in('identificacion', batch)
      ingCortesias?.forEach(ing => {
        checkInsMap[ing.identificacion] = (checkInsMap[ing.identificacion] || 0) + 1
      })
    }

    // Obtener datos de clientes para enriquecer
    let clienteMap = {}
    for (let i = 0; i < cortesiasIds.length; i += BATCH) {
      const batch = cortesiasIds.slice(i, i + BATCH)
      const { data: cData } = await supabase
        .from('clientes')
        .select('identificacion, nombre_completo, celular')
        .in('identificacion', batch)
      cData?.forEach(c => { clienteMap[c.identificacion] = c })
    }

    const detalleCortesias = cortesiasSinConvertirAll.map(c => {
      const cliente = clienteMap[c.identificacion_cliente] || {}
      return {
        nombre: cliente.nombre_completo || c.nombre_cliente,
        celular: cliente.celular || '',
        cortesia: c.nombre_plan || '',
        sede: c.nombre_sucursal_vende || getNombreSucursal(c.sucursal_codigo),
        check_ins: checkInsMap[c.identificacion_cliente] || 0,
        tiene_plan: false
      }
    })

    return NextResponse.json({
      inactivos,
      preRenovacion,
      fantasmas,
      cortesiasSinConvertir: {
        total: detalleCortesias.length,
        detalle: detalleCortesias
      }
    })
  } catch (error) {
    console.error('Error en /api/marketing:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

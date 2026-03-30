import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getNombreSucursal } from '../../../lib/constants'

const PAGE_SIZE = 1000

// Helper: IDs con plan vigente (paginado)
async function getIdsConPlanVigente() {
  const today = new Date().toISOString().split('T')[0]
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

// Helper: todos los clientes (paginado)
async function getAllClientes() {
  const clientes = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('clientes')
      .select('identificacion, nombre_completo, celular, correo_electronico, sucursal_codigo')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break
    clientes.push(...data)
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return clientes
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const hace15dias = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const en30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const en60dias = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // 1. IDs con plan vigente
    const idsConPlan = await getIdsConPlanVigente()
    const idsConPlanArray = [...idsConPlan]

    // 2. Todos los clientes
    const todosClientes = await getAllClientes()
    const clienteMap = {}
    todosClientes.forEach(c => { clienteMap[c.identificacion] = c })

    // ─── SEGMENTO 1: INACTIVOS ───────────────────────────────────────────────
    // Clientes sin plan vigente y con celular
    const clientesInactivos = todosClientes.filter(c =>
      !idsConPlan.has(c.identificacion) && c.celular
    )
    const totalInactivos = clientesInactivos.length

    // Para TODOS los inactivos, buscar su última factura (batches de 500)
    const inactivosAll = clientesInactivos
    const inactivosIds = inactivosAll.map(c => c.identificacion)

    let ultimaFacturaMap = {}
    for (let i = 0; i < inactivosIds.length; i += BATCH) {
      const batch = inactivosIds.slice(i, i + BATCH)
      const { data: facturasInactivos } = await supabase
        .from('facturas')
        .select('identificacion_cliente, nombre_plan, total, fecha_vencimiento')
        .in('identificacion_cliente', batch)
        .eq('estado_anulada', false)
        .order('fecha_vencimiento', { ascending: false })

      facturasInactivos?.forEach(f => {
        if (!ultimaFacturaMap[f.identificacion_cliente]) {
          ultimaFacturaMap[f.identificacion_cliente] = f
        }
      })
    }

    const detalleInactivos = inactivosAll.map(c => {
      const uf = ultimaFacturaMap[c.identificacion] || {}
      const diasSinPlan = uf.fecha_vencimiento
        ? Math.floor((Date.now() - new Date(uf.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24))
        : null
      return {
        nombre: c.nombre_completo,
        celular: c.celular,
        email: c.correo_electronico || '',
        sede: getNombreSucursal(c.sucursal_codigo),
        ultimo_plan: uf.nombre_plan || '',
        ultimo_valor: uf.total || 0,
        dias_sin_plan: diasSinPlan
      }
    }).sort((a, b) => b.ultimo_valor - a.ultimo_valor)

    // ─── SEGMENTO 2: PRE-RENOVACIÓN ──────────────────────────────────────────
    // Facturas vigentes que vencen en 30-60 días
    const { data: facturasPreReno } = await supabase
      .from('facturas')
      .select('identificacion_cliente, nombre_cliente, nombre_plan, total, fecha_vencimiento, sucursal_codigo')
      .gte('fecha_vencimiento', en30dias)
      .lte('fecha_vencimiento', en60dias)
      .eq('estado_anulada', false)
      .order('fecha_vencimiento', { ascending: true })

    // Anti-duplicados: solo la factura más reciente con vencimiento en ese rango por cliente
    const preRenoUnico = {}
    facturasPreReno?.forEach(f => {
      const prev = preRenoUnico[f.identificacion_cliente]
      if (!prev || f.fecha_vencimiento > prev.fecha_vencimiento) {
        preRenoUnico[f.identificacion_cliente] = f
      }
    })

    // Verificar que esta sea realmente su factura más reciente (no tienen otra más nueva)
    const preRenoIds = Object.keys(preRenoUnico)
    let maxVencPreReno = {}
    if (preRenoIds.length > 0) {
      const { data: facturasMax } = await supabase
        .from('facturas')
        .select('identificacion_cliente, fecha_vencimiento')
        .in('identificacion_cliente', preRenoIds)
        .eq('estado_anulada', false)
        .order('fecha_vencimiento', { ascending: false })

      facturasMax?.forEach(f => {
        if (!maxVencPreReno[f.identificacion_cliente]) {
          maxVencPreReno[f.identificacion_cliente] = f.fecha_vencimiento
        }
      })
    }

    const detallePreRenovacionAll = Object.values(preRenoUnico)
      .filter(f => maxVencPreReno[f.identificacion_cliente] === f.fecha_vencimiento)

    const totalPreRenovacion = detallePreRenovacionAll.length
    const detallePreRenovacion = detallePreRenovacionAll.map(f => {
      const cliente = clienteMap[f.identificacion_cliente] || {}
      const diasRestantes = Math.ceil(
        (new Date(f.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)
      )
      return {
        nombre: cliente.nombre_completo || f.nombre_cliente,
        celular: cliente.celular || '',
        plan_actual: f.nombre_plan || '',
        valor: f.total || 0,
        fecha_vencimiento: f.fecha_vencimiento,
        dias_restantes: diasRestantes,
        sede: getNombreSucursal(f.sucursal_codigo)
      }
    })

    // ─── SEGMENTO 3: FANTASMAS ───────────────────────────────────────────────
    // Clientes con plan vigente pero sin check-in en 15+ días
    // Query inteligente: ingresos solo últimos 30 días para IDs con plan
    let idsConCheckInReciente = new Set()

    // Procesar en batches de 500 para no sobrepasar límite de IN()
    const BATCH = 500
    for (let i = 0; i < idsConPlanArray.length; i += BATCH) {
      const batch = idsConPlanArray.slice(i, i + BATCH)
      const { data: ingRecientes } = await supabase
        .from('ingresos')
        .select('identificacion')
        .in('identificacion', batch)
        .gte('fecha', hace15dias)

      ingRecientes?.forEach(ing => idsConCheckInReciente.add(ing.identificacion))
    }

    // Fantasmas: tienen plan pero NO aparecen en ingresos recientes
    const fantasmasAll = idsConPlanArray.filter(id => !idsConCheckInReciente.has(id))
    const totalFantasmas = fantasmasAll.length
    // Obtener último check-in de TODOS los fantasmas (batches de 500)
    let ultimoCheckinMap = {}
    for (let i = 0; i < fantasmasAll.length; i += BATCH) {
      const batch = fantasmasAll.slice(i, i + BATCH)
      const { data: lastCheckins } = await supabase
        .from('ingresos')
        .select('identificacion, fecha')
        .in('identificacion', batch)
        .order('fecha', { ascending: false })

      lastCheckins?.forEach(ing => {
        if (!ultimoCheckinMap[ing.identificacion]) {
          ultimoCheckinMap[ing.identificacion] = ing.fecha
        }
      })
    }

    // Obtener factura vigente de TODOS los fantasmas (batches de 500)
    let planFantasmaMap = {}
    for (let i = 0; i < fantasmasAll.length; i += BATCH) {
      const batch = fantasmasAll.slice(i, i + BATCH)
      const { data: facturasVig } = await supabase
        .from('facturas')
        .select('identificacion_cliente, nombre_plan')
        .in('identificacion_cliente', batch)
        .gte('fecha_vencimiento', today)
        .eq('estado_anulada', false)
        .order('fecha_vencimiento', { ascending: false })

      facturasVig?.forEach(f => {
        if (!planFantasmaMap[f.identificacion_cliente]) {
          planFantasmaMap[f.identificacion_cliente] = f.nombre_plan
        }
      })
    }

    const detalleFantasmas = fantasmasAll.map(id => {
      const c = clienteMap[id] || {}
      const ultimoCI = ultimoCheckinMap[id] || null
      const diasSinIr = ultimoCI
        ? Math.floor((Date.now() - new Date(ultimoCI).getTime()) / (1000 * 60 * 60 * 24))
        : null
      return {
        nombre: c.nombre_completo || id,
        celular: c.celular || '',
        plan_actual: planFantasmaMap[id] || '',
        sede: getNombreSucursal(c.sucursal_codigo),
        ultimo_checkin: ultimoCI,
        dias_sin_ir: diasSinIr
      }
    }).sort((a, b) => (b.dias_sin_ir || 0) - (a.dias_sin_ir || 0))

    // ─── SEGMENTO 4: CORTESÍAS SIN CONVERTIR ─────────────────────────────────
    const { data: cortesias } = await supabase
      .from('cortesias')
      .select('identificacion_cliente, nombre_cliente, nombre_plan, sucursal_codigo, nombre_sucursal_vende, tiquetes_entrada')
      .eq('estado_anulada', false)
      .gte('fecha_vencimiento', today)

    const cortesiasUnico = {}
    cortesias?.forEach(c => {
      if (!cortesiasUnico[c.identificacion_cliente]) {
        cortesiasUnico[c.identificacion_cliente] = c
      }
    })

    const cortesiasSinConvertirAll = Object.values(cortesiasUnico)
      .filter(c => !idsConPlan.has(c.identificacion_cliente))

    const totalCortesias = cortesiasSinConvertirAll.length

    // Check-ins de las cortesías
    const cortesiasIds = cortesiasSinConvertirAll.map(c => c.identificacion_cliente)
    let checkInsMapCortesias = {}
    if (cortesiasIds.length > 0) {
      const { data: ingCortesias } = await supabase
        .from('ingresos')
        .select('identificacion')
        .in('identificacion', cortesiasIds)

      ingCortesias?.forEach(i => {
        checkInsMapCortesias[i.identificacion] = (checkInsMapCortesias[i.identificacion] || 0) + 1
      })
    }

    const detalleCortesias = cortesiasSinConvertirAll.map(c => {
      const cliente = clienteMap[c.identificacion_cliente] || {}
      return {
        nombre: cliente.nombre_completo || c.nombre_cliente,
        celular: cliente.celular || '',
        cortesia: c.nombre_plan || '',
        sede: c.nombre_sucursal_vende || getNombreSucursal(c.sucursal_codigo),
        check_ins: checkInsMapCortesias[c.identificacion_cliente] || 0,
        tiene_plan: false
      }
    })

    return NextResponse.json({
      inactivos: {
        total: totalInactivos,
        detalle: detalleInactivos
      },
      preRenovacion: {
        total: totalPreRenovacion,
        detalle: detallePreRenovacion
      },
      fantasmas: {
        total: totalFantasmas,
        detalle: detalleFantasmas
      },
      cortesiasSinConvertir: {
        total: totalCortesias,
        detalle: detalleCortesias
      }
    })

  } catch (error) {
    console.error('Error en /api/marketing:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

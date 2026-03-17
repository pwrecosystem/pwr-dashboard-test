import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nfdffurucafdrjuhqeqs.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZGZmdXJ1Y2FmZHJqdWhxZXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3OTQ3MywiZXhwIjoyMDg1MzU1NDczfQ.HXdsUEaRv_rSvuk2Q-zAdORdAZkdLnA--Uq8c7nbdBQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Clientes sin plan activo después de su vencimiento en marzo 2026
const CLIENTES_SIN_PLAN = [
  '1000156767','1000415004','1000417205','1000547413','1013590794','1017199385',
  '1017209060','1017247757','1017262432','1018484389','1019054438','1020774223',
  '1021923398','1026159781','1034986123','1034998525','1036618742','1036650405',
  '1036682763','1037574842','1037585774','1037587435','103761534','1037622017',
  '1037625738','1037628893','1037647715','1037649708','1037655559','1037659136',
  '1038415108','1039465005','1040183745','1041232969','1042242929','1053828750',
  '1053839366','1053931692','1067880465','1069470492','1090491814','1091675261',
  '1095804384','1128268952','1128404664','1136887931','1144097173','1148218938',
  '1152197505','1152220591','1152445374','1152446885','1152447950','1152449122',
  '1152449123','1152458220','1214739543','1238938221','1463057','196955033',
  '29568299','32180653','32244839','32564929','43222057','43268079','43876025',
  '43876442','444582','70559536','71386464','71790715','8126845','924264',
  '98541097','98669390','98670637','98672488','98762812'
]

export default async function handler(req, res) {
  const { fechai = '2026-03-01', fechaf = '2026-03-31', sinplan = 'true' } = req.query
  
  let query = supabase
    .from('facturas')
    .select('id, identificacion_cliente, nombre_cliente, fecha_vencimiento, total, sucursal_codigo, estado_anulada')
    .gte('fecha_vencimiento', fechai)
    .lte('fecha_vencimiento', fechaf)
    .eq('estado_anulada', false)
    .order('fecha_vencimiento', { ascending: true })
  
  const { data: facturas, error } = await query
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  let facturasFiltradas = facturas
  if (sinplan === 'true') {
    facturasFiltradas = facturas.filter(f => CLIENTES_SIN_PLAN.includes(f.identificacion_cliente))
  }
  
  const clientesIds = [...new Set(facturasFiltradas.map(f => f.identificacion_cliente))]
  const { data: clientes } = await supabase
    .from('clientes')
    .select('identificacion, nombre_completo, celular, correo_electronico')
    .in('identificacion', clientesIds)
  
  const clientesMap = {}
  clientes?.forEach(c => {
    clientesMap[c.identificacion] = c
  })
  
  const detalle = facturasFiltradas.map(f => ({
    ...f,
    celular: clientesMap[f.identificacion_cliente]?.celular || '',
    correo: clientesMap[f.identificacion_cliente]?.correo_electronico || ''
  }))
  
  const total = detalle.reduce((a, b) => a + b.total, 0)
  
  res.json({
    periodo: { inicio: fechai, fin: fechaf },
    totales: { cantidad: detalle.length, valor: total },
    detalle
  })
}

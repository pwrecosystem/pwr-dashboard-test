import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nfdffurucafdrjuhqeqs.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZGZmdXJ1Y2FmZHJqdWhxZXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc3OTQ3MywiZXhwIjoyMDg1MzU1NDczfQ.HXdsUEaRv_rSvuk2Q-zAdORdAZkdLnA--Uq8c7nbdBQ'

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  const { fechai = '2026-03-01', fechaf = '2026-04-30' } = req.query
  
  const { data: facturas, error } = await supabase
    .from('facturas')
    .select('id, identificacion_cliente, nombre_cliente, fecha_vencimiento, total, sucursal_codigo, estado_anulada')
    .gte('fecha_vencimiento', fechai)
    .lte('fecha_vencimiento', fechaf)
    .eq('estado_anulada', false)
    .order('fecha_vencimiento', { ascending: true })
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  const marzo = facturas.filter(f => f.fecha_vencimiento.startsWith('2026-03'))
  const abril = facturas.filter(f => f.fecha_vencimiento.startsWith('2026-04'))
  
  res.json({
    periodo: { inicio: fechai, fin: fechaf },
    totales: {
      marzo: { cantidad: marzo.length, valor: marzo.reduce((a, b) => a + b.total, 0) },
      abril: { cantidad: abril.length, valor: abril.reduce((a, b) => a + b.total, 0) }
    },
    detalle: { marzo, abril }
  })
}

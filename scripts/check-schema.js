const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Leer .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    env[key.trim()] = value.trim()
  }
})

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

async function checkTables() {
  console.log('🔍 Consultando tablas en Supabase...\n')
  
  const relevantTables = ['clientes', 'facturas', 'ingresos', 'sucursales', 'abonados', 'cortesias', 'membresias', 'planes']
  
  for (const table of relevantTables) {
    console.log(`\n📊 Tabla: "${table}"`)
    console.log('─'.repeat(50))
    
    // Intentar obtener 1 registro
    const { data: sample, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`)
      continue
    }
    
    if (!sample || sample.length === 0) {
      console.log(`  ⚠️ Tabla vacía`)
      continue
    }
    
    console.log(`  ✅ Columnas (${Object.keys(sample[0]).length}):`)
    Object.keys(sample[0]).forEach(col => {
      const value = sample[0][col]
      const type = typeof value
      const strVal = JSON.stringify(value)
      const shortVal = strVal?.length > 50 ? strVal.substring(0, 50) + '...' : strVal
      console.log(`    - ${col}: ${type} (ej: ${shortVal})`)
    })
    
    // Contar registros
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    console.log(`  📈 Total registros: ${count || 'N/A'}`)
  }
}

checkTables().catch(console.error)

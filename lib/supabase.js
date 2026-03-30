import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://nfdffurucafdrjuhqeqs.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseKey) {
  console.error('⚠️ SUPABASE_SERVICE_KEY no configurada')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // This will surface immediately in the console during development
  console.error(
    '❌ Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
  )
  // Throwing stops the app from trying to use an invalid client
  throw new Error('Supabase configuration missing')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
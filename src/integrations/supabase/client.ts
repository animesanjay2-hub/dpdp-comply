import { createClient } from '@supabase/supabase-js'

const createSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Return a dummy client on the server side
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({ select: () => Promise.resolve({ data: null, error: null }) }),
        single: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
    }
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oqvgpmpgsajbceuxrjuc.supabase.co"
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdmdwbXBnc2FqYmNldXhyanVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjcxODMsImV4cCI6MjA5MjIwMzE4M30._rMkV9raZt634Qko8FbOWivvcmbWksn29eLORNDQqW4"

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = createSupabaseClient()
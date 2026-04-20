import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oqvgpmpgsajbceuxrjuc.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdmdwbXBnc2FqYmNldXhyanVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjcxODMsImV4cCI6MjA5MjIwMzE4M30._rMkV9raZt634Qko8FbOWivvcmbWksn29eLORNDQqW4"

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
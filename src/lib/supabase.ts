import { createBrowserClient } from '@supabase/ssr'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}

let cachedClient: ReturnType<typeof getSupabase> | null = null

export function createClient() {
  if (cachedClient) return cachedClient
  cachedClient = getSupabase()
  return cachedClient
}

export type SupabaseClient = ReturnType<typeof createClient>

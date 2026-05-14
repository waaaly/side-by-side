import { createBrowserClient } from '@supabase/ssr'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            return window.localStorage.getItem(key)
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            window.localStorage.setItem(key, value)
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            window.localStorage.removeItem(key)
          },
        },
      },
    },
  )
}

let cachedClient: ReturnType<typeof getSupabase> | null = null

export function createClient() {
  if (cachedClient) return cachedClient
  cachedClient = getSupabase()
  return cachedClient
}

export type SupabaseClient = ReturnType<typeof createClient>

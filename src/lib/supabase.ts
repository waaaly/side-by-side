import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: true, // 开启持久化
        storageKey: "sb-couple-auth", // 显式指定一个专属的本地键名
        storage: {
          getItem: (key: string) => {
            if (typeof window === "undefined") return null;
            return window.localStorage.getItem(key);
          },
          setItem: (key: string, value: string) => {
            if (typeof window === "undefined") return;
            window.localStorage.setItem(key, value);
          },
          removeItem: (key: string) => {
            if (typeof window === "undefined") return;
            window.localStorage.removeItem(key);
          },
        },
      },
    },
  );
}

let cachedClient: ReturnType<typeof getSupabase> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;
  cachedClient = getSupabase();
  return cachedClient;
}

export type SupabaseClient = ReturnType<typeof createClient>;

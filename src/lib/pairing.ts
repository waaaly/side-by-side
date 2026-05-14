import { createClient } from './supabase'

function supabase() {
  return createClient()
}

const STORAGE_KEY = 'sbs_pair_id'
const PARTNER_KEY = 'sbs_partner_id'
const PAIR_CODE_KEY = 'sbs_pair_code'

/* ─── 当前用户 ID ──────────────────────────── */

export async function getCurrentUserId(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const { data: { session } } = await supabase().auth.getSession()
  return session?.user?.id ?? null
}

/* ─── 伴侣 ID（已配对的另一方） ─────────────── */

export function getStoredPartnerId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PARTNER_KEY)
}

export function getStoredPairId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function getStoredPairCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PAIR_CODE_KEY)
}

async function resolvePartnerId(pairId: string, myId: string): Promise<string | null> {
  const { data: pair } = await supabase()
    .from('pairs')
    .select('members')
    .eq('id', pairId)
    .single()

  if (!pair) return null
  const partner = (pair.members as string[]).find((id) => id !== myId)
  return partner ?? null
}

export async function syncPairInfo(): Promise<{
  pairId: string | null
  pairCode: string | null
  partnerId: string | null
}> {
  const myId = await getCurrentUserId()
  if (!myId) return { pairId: null, pairCode: null, partnerId: null }

  const pairId = getStoredPairId()
  if (!pairId) return { pairId: null, pairCode: null, partnerId: null }

  const partnerId = await resolvePartnerId(pairId, myId)
  if (partnerId) {
    localStorage.setItem(PARTNER_KEY, partnerId)
  }

  return {
    pairId,
    pairCode: getStoredPairCode(),
    partnerId,
  }
}

/* ─── 创建 / 加入配对 ───────────────────────── */

export async function createPair(): Promise<{
  pairId: string
  pairCode: string
  partnerId: string | null
} | null> {
  const myId = await getCurrentUserId()
  if (!myId) return null

  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const { data } = await supabase()
    .from('pairs')
    .insert({ pair_code: code, members: [myId] })
    .select()
    .single()

  if (!data) return null
  localStorage.setItem(STORAGE_KEY, data.id)
  localStorage.setItem(PAIR_CODE_KEY, data.pair_code)
  return { pairId: data.id, pairCode: data.pair_code, partnerId: null }
}

export async function joinPair(code: string): Promise<{
  pairId: string
  pairCode: string
  partnerId: string | null
} | null> {
  const myId = await getCurrentUserId()
  if (!myId) return null

  const { data: pair } = await supabase()
    .from('pairs')
    .select('*')
    .eq('pair_code', code.toUpperCase())
    .maybeSingle()

  if (!pair) return null
  if (pair.members.includes(myId)) {
    localStorage.setItem(STORAGE_KEY, pair.id)
    localStorage.setItem(PAIR_CODE_KEY, pair.pair_code)
    const partnerId = (pair.members as string[]).find((id) => id !== myId) ?? null
    if (partnerId) localStorage.setItem(PARTNER_KEY, partnerId)
    return { pairId: pair.id, pairCode: pair.pair_code, partnerId }
  }

  const { data: updated } = await supabase()
    .from('pairs')
    .update({ members: [...pair.members, myId] })
    .eq('id', pair.id)
    .select()
    .single()

  if (!updated) return null
  localStorage.setItem(STORAGE_KEY, updated.id)
  localStorage.setItem(PAIR_CODE_KEY, updated.pair_code)
  const partnerId = (updated.members as string[]).find((id) => id !== myId) ?? null
  if (partnerId) localStorage.setItem(PARTNER_KEY, partnerId)
  return { pairId: updated.id, pairCode: updated.pair_code, partnerId }
}

export function isPaired(): boolean {
  return !!getStoredPairId()
}

export function resetPairing(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PAIR_CODE_KEY)
  localStorage.removeItem(PARTNER_KEY)
}

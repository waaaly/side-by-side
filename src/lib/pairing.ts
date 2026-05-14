import { createClient } from './supabase'

function supabase() {
  return createClient()
}

const STORAGE_KEY = 'sbs_pair_id'
const MEMBER_KEY = 'sbs_member_id'
const PAIR_CODE_KEY = 'sbs_pair_code'

export function getStoredPairId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function getStoredMemberId(): string {
  if (typeof window === 'undefined') return 'local-dev'
  let id = localStorage.getItem(MEMBER_KEY)
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    localStorage.setItem(MEMBER_KEY, id)
  }
  return id
}

export function getStoredPairCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PAIR_CODE_KEY)
}

export async function createOrJoinPair(): Promise<{
  pairId: string
  pairCode: string
  isNew: boolean
}> {
  const memberId = getStoredMemberId()
  const existing = getStoredPairId()

  if (existing) {
    return { pairId: existing, pairCode: getStoredPairCode() ?? '', isNew: false }
  }

  const { data: existingPair } = await supabase()
    .from('pairs')
    .select('id, pair_code')
    .contains('members', [memberId])
    .single()

  if (existingPair) {
    localStorage.setItem(STORAGE_KEY, existingPair.id)
    localStorage.setItem(PAIR_CODE_KEY, existingPair.pair_code)
    return { pairId: existingPair.id, pairCode: existingPair.pair_code, isNew: false }
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const { data: newPair } = await supabase()
    .from('pairs')
    .insert({ pair_code: code, members: [memberId] })
    .select()
    .single()

  if (newPair) {
    localStorage.setItem(STORAGE_KEY, newPair.id)
    localStorage.setItem(PAIR_CODE_KEY, newPair.pair_code)
    return { pairId: newPair.id, pairCode: newPair.pair_code, isNew: true }
  }

  throw new Error('Failed to create pair')
}

export async function tryJoinPair(code: string): Promise<boolean> {
  const memberId = getStoredMemberId()
  const { data: pair } = await supabase()
    .from('pairs')
    .select('*')
    .eq('pair_code', code.toUpperCase())
    .single()

  if (!pair) return false
  if (pair.members.includes(memberId)) {
    localStorage.setItem(STORAGE_KEY, pair.id)
    localStorage.setItem(PAIR_CODE_KEY, pair.pair_code)
    return true
  }

  const { data: updated } = await supabase()
    .from('pairs')
    .update({ members: [...pair.members, memberId] })
    .eq('id', pair.id)
    .select()
    .single()

  if (updated) {
    localStorage.setItem(STORAGE_KEY, updated.id)
    localStorage.setItem(PAIR_CODE_KEY, updated.pair_code)
    return true
  }

  return false
}

export function resetPairing(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PAIR_CODE_KEY)
}

export function getPairCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PAIR_CODE_KEY)
}

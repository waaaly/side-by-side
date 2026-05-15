import { createClient } from './supabase'

function supabase() {
  return createClient()
}

const STORAGE_KEY = 'sbs_pair_id'
const PARTNER_KEY = 'sbs_partner_id'
const PAIR_CODE_KEY = 'sbs_pair_code'
const MY_EMAIL_KEY = 'sbs_my_email'
const PARTNER_EMAIL_KEY = 'sbs_partner_email'

/* ─── 当前用户 ─────────────────────────────── */

export async function getCurrentUserId(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const { data: { session } } = await supabase().auth.getSession()
  return session?.user?.id ?? null
}

export async function getCurrentUserEmail(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const { data: { session } } = await supabase().auth.getSession()
  return session?.user?.email ?? null
}

/* ─── 存储的配对信息 ───────────────────────── */

export function getStoredPairId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function getStoredPairCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PAIR_CODE_KEY)
}

export function getStoredPartnerId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PARTNER_KEY)
}

export function getStoredPartnerEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PARTNER_EMAIL_KEY)
}

export function getStoredMyEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(MY_EMAIL_KEY)
}

export function isPaired(): boolean {
  return !!getStoredPairId() && !!getStoredPartnerId()
}

/* ─── 更新 pairs 表的 metadata ─────────────── */

async function updatePairMetadata(pairId: string, metadata: Record<string, unknown>) {
  await supabase()
    .from('pairs')
    .update({ metadata })
    .eq('id', pairId)
}

async function getPairMetadata(pairId: string): Promise<Record<string, unknown> | null> {
  const { data } = await supabase()
    .from('pairs')
    .select('metadata')
    .eq('id', pairId)
    .single()
  return (data?.metadata ?? null) as Record<string, unknown> | null
}

/* ─── 从 DB 恢复本地配对信息 ─────────────────── */

async function restoreFromDb(pairId: string, myId: string): Promise<void> {
  const { data: pair } = await supabase()
    .from('pairs')
    .select('pair_code, members, metadata')
    .eq('id', pairId)
    .single()

  if (!pair) return

  localStorage.setItem(PAIR_CODE_KEY, pair.pair_code)

  const partnerId = (pair.members as string[]).find((id) => id !== myId)
  if (partnerId) {
    localStorage.setItem(PARTNER_KEY, partnerId)
  }

  const meta = pair.metadata as Record<string, string[]> | null
  const emails = meta?.emails as string[] | undefined
  if (emails) {
    const myEmail = emails.find((_, i) => {
      const memberId = (pair.members as string[])[i]
      return memberId === myId
    })
    const partnerEmail = emails.find((_, i) => {
      const memberId = (pair.members as string[])[i]
      return memberId !== myId
    })
    if (myEmail) localStorage.setItem(MY_EMAIL_KEY, myEmail)
    if (partnerEmail) localStorage.setItem(PARTNER_EMAIL_KEY, partnerEmail)
  }
}

/* ─── 创建配对 ──────────────────────────────── */

export async function createPair(): Promise<{
  pairId: string
  pairCode: string
} | null> {
  const myId = await getCurrentUserId()
  const myEmail = await getCurrentUserEmail()
  if (!myId) return null

  // 检查是否已有配对记录
  const existingPairId = getStoredPairId()
  if (existingPairId) {
    await restoreFromDb(existingPairId, myId)
    const storedPartnerId = getStoredPartnerId()
    if (storedPartnerId) return null // 已配对，不能重复创建
    return { pairId: existingPairId, pairCode: getStoredPairCode() ?? '' }
  }

  // 检查数据库中是否已有此用户的配对
  const { data: existing } = await supabase()
    .from('pairs')
    .select('id, pair_code, members, metadata')
    .contains('members', [myId])
    .maybeSingle()

  if (existing) {
    localStorage.setItem(STORAGE_KEY, existing.id)
    await restoreFromDb(existing.id, myId)
    const storedPartnerId = getStoredPartnerId()
    if (storedPartnerId) return null
    return { pairId: existing.id, pairCode: existing.pair_code }
  }

  // 创建新配对
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const { data } = await supabase()
    .from('pairs')
    .insert({
      pair_code: code,
      members: [myId],
      metadata: { emails: [myEmail] },
    })
    .select()
    .single()

  if (!data) return null
  localStorage.setItem(STORAGE_KEY, data.id)
  localStorage.setItem(PAIR_CODE_KEY, data.pair_code)
  if (myEmail) localStorage.setItem(MY_EMAIL_KEY, myEmail)
  return { pairId: data.id, pairCode: data.pair_code }
}

/* ─── 加入配对 ──────────────────────────────── */

export async function joinPair(code: string): Promise<{
  pairId: string
  pairCode: string
  partnerEmail: string | null
} | null> {
  const myId = await getCurrentUserId()
  const myEmail = await getCurrentUserEmail()
  if (!myId) return null

  const { data: pair } = await supabase()
    .from('pairs')
    .select('*')
    .eq('pair_code', code.toUpperCase())
    .maybeSingle()

  if (!pair) return null

  // 防止自己加入自己的配对
  if ((pair.members as string[]).includes(myId)) {
    localStorage.setItem(STORAGE_KEY, pair.id)
    await restoreFromDb(pair.id, myId)
    return {
      pairId: pair.id,
      pairCode: pair.pair_code,
      partnerEmail: getStoredPartnerEmail(),
    }
  }

  // 已满两人
  if ((pair.members as string[]).length >= 2) {
    return null
  }

  const existingEmail = ((pair.metadata as Record<string, unknown>)?.emails as string[])?.[0] ?? null

  const { data: updated } = await supabase()
    .from('pairs')
    .update({
      members: [...pair.members, myId],
      metadata: { emails: [existingEmail, myEmail] },
    })
    .eq('id', pair.id)
    .select()
    .single()

  if (!updated) return null

  localStorage.setItem(STORAGE_KEY, updated.id)
  localStorage.setItem(PAIR_CODE_KEY, updated.pair_code)
  if (myEmail) localStorage.setItem(MY_EMAIL_KEY, myEmail)
  if (existingEmail) localStorage.setItem(PARTNER_EMAIL_KEY, existingEmail)

  const partnerId = (updated.members as string[]).find((id) => id !== myId)
  if (partnerId) localStorage.setItem(PARTNER_KEY, partnerId)

  return { pairId: updated.id, pairCode: updated.pair_code, partnerEmail: existingEmail }
}

/* ─── 获取伴侣信息 ──────────────────────────── */

export async function refreshPartnerInfo(): Promise<{
  partnerEmail: string | null
  myEmail: string | null
  partnerExists: boolean
}> {
  const myId = await getCurrentUserId()
  const pairId = getStoredPairId()
  if (!myId || !pairId) {
    return { partnerEmail: null, myEmail: null, partnerExists: false }
  }

  const { data: pair } = await supabase()
    .from('pairs')
    .select('members, metadata')
    .eq('id', pairId)
    .single()

  if (!pair) return { partnerEmail: null, myEmail: null, partnerExists: false }

  const members = pair.members as string[]
  const partnerId = members.find((id) => id !== myId)
  const partnerExists = members.length >= 2 && !!partnerId

  if (partnerId) {
    localStorage.setItem(PARTNER_KEY, partnerId)
  }

  const meta = pair.metadata as Record<string, unknown> | null
  const emails = (meta?.emails ?? []) as string[]
  const myEmail = emails.find((_, i) => members[i] === myId) ?? null
  const partnerEmail = emails.find((_, i) => members[i] !== myId) ?? null

  if (myEmail) localStorage.setItem(MY_EMAIL_KEY, myEmail)
  if (partnerEmail) localStorage.setItem(PARTNER_EMAIL_KEY, partnerEmail)

  return { partnerEmail, myEmail, partnerExists }
}

/* ─── 解除配对 ──────────────────────────────── */

export async function unpair(): Promise<void> {
  const pairId = getStoredPairId()
  const myId = await getCurrentUserId()
  if (!pairId || !myId) return

  // 从 pairs 中移除自己
  const { data: pair } = await supabase()
    .from('pairs')
    .select('members, metadata')
    .eq('id', pairId)
    .single()

  if (!pair) return

  const members = (pair.members as string[]).filter((id) => id !== myId)
  const meta = pair.metadata as Record<string, unknown> | null
  const emails = ((meta?.emails ?? []) as string[]).filter((_, i) => {
    const originalMembers = pair.members as string[]
    return originalMembers[i] !== myId
  })

  if (members.length === 0) {
    await supabase().from('pairs').delete().eq('id', pairId)
  } else {
    await supabase()
      .from('pairs')
      .update({ members, metadata: emails.length > 0 ? { emails } : null })
      .eq('id', pairId)
  }

  resetPairing()
}

/* ─── 重置 ──────────────────────────────────── */

export function resetPairing(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PAIR_CODE_KEY)
  localStorage.removeItem(PARTNER_KEY)
  localStorage.removeItem(MY_EMAIL_KEY)
  localStorage.removeItem(PARTNER_EMAIL_KEY)
}

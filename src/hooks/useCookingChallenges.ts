'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { CookingChallenge } from '@/types'

function toChallenge(row: Record<string, unknown>): CookingChallenge {
  return {
    id: row.id as string,
    recipeId: row.recipe_id as string,
    fromUser: row.from_user as string,
    toUser: row.to_user as string,
    status: (row.status as string) as CookingChallenge['status'],
    note: (row.note as string) ?? undefined,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string) ?? undefined,
  }
}

export function useCookingChallenges() {
  const [challenges, setChallenges] = useState<CookingChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('cooking_challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setChallenges((data ?? []).map(toChallenge))
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('challenges:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cooking_challenges' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addChallenge = useCallback(async (data: {
    recipeId: string
    fromUser: string
    toUser: string
    note?: string
  }) => {
    const supabase = createClient()
    const { data: created } = await supabase
      .from('cooking_challenges')
      .insert({
        recipe_id: data.recipeId,
        from_user: data.fromUser,
        to_user: data.toUser,
        note: data.note ?? null,
      })
      .select()
      .single()
    return created ? toChallenge(created as Record<string, unknown>) : null
  }, [])

  const updateChallengeStatus = useCallback(async (id: string, status: 'accepted' | 'completed') => {
    const supabase = createClient()
    const updates: Record<string, unknown> = { status }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }
    const { data } = await supabase
      .from('cooking_challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return data ? toChallenge(data as Record<string, unknown>) : null
  }, [])

  return { challenges, addChallenge, updateChallengeStatus, loading }
}

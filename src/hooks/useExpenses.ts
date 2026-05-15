'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { getCurrentUserId, getStoredPartnerId } from '@/lib/pairing'
import type { Expense } from '@/types'

export function useExpenses(pairId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserId().then(setMyId)
  }, [])

  const partnerId = getStoredPartnerId()

  function toExpense(row: Record<string, unknown>): Expense {
    const createdBy = row.created_by as string
      return {
        id: row.id as string,
        amount: row.amount as number,
        category: row.category as Expense['category'],
        description: row.description as string,
        date: row.date as string,
        recipeId: (row.recipe_id as string) ?? undefined,
        createdBy: createdBy === myId ? 'me' : createdBy === partnerId ? 'partner' : 'me',
      }
  }

  useEffect(() => {
    if (!pairId) return

    const supabase = createClient()

    const load = async () => {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('expenses')
        .select('*')
        .eq('pair_id', pairId)
        .order('date', { ascending: false })
      if (err) {
        setError(err.message)
      } else {
        setExpenses((data ?? []).map((r) => toExpense(r as Record<string, unknown>)))
      }
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`expenses:${pairId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `pair_id=eq.${pairId}` },
        async () => { await load() },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pairId, myId, partnerId])

  const addExpense = useCallback(async (
    data: { amount: number; category: string; description: string; date: string; recipeId?: string; createdBy?: string },
  ) => {
    if (!pairId) return null
    const supabase = createClient()
    const userId = await getCurrentUserId()
    const { recipeId, ...rest } = data
    const { data: created, error: err } = await supabase
      .from('expenses')
      .insert({ pair_id: pairId, ...rest, recipe_id: recipeId ?? null, created_by: data.createdBy ?? userId })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    return created ? toExpense(created as Record<string, unknown>) : null
  }, [pairId])

  const updateExpense = useCallback(async (
    id: string,
    updates: { amount?: number; category?: string; description?: string; date?: string; recipeId?: string; createdBy?: string },
  ) => {
    const supabase = createClient()
    const { recipeId, createdBy, ...rest } = updates
    const dbUpdates: Record<string, unknown> = {
      ...rest,
      recipe_id: recipeId ?? null,
      last_edited_at: new Date().toISOString(),
    }
    if (createdBy) {
      dbUpdates.created_by = createdBy
    }
    const { error: err } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
    if (err) setError(err.message)
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error: err } = await supabase.from('expenses').delete().eq('id', id)
    if (err) setError(err.message)
  }, [])

  return { expenses, addExpense, updateExpense, deleteExpense, loading, error, myId, partnerId }
}

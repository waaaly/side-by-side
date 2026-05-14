'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Expense } from '@/types'

export function useExpenses(pairId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setExpenses((data ?? []) as unknown as Expense[])
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
  }, [pairId])

  const addExpense = useCallback(async (
    data: { amount: number; category: string; description: string; date: string },
  ) => {
    if (!pairId) return null
    const supabase = createClient()
    const { data: created, error: err } = await supabase
      .from('expenses')
      .insert({ pair_id: pairId, ...data })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    return created as unknown as Expense
  }, [pairId])

  const updateExpense = useCallback(async (
    id: string,
    updates: { amount?: number; category?: string; description?: string; date?: string },
  ) => {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('expenses')
      .update({ ...updates, last_edited_at: new Date().toISOString() })
      .eq('id', id)
    if (err) setError(err.message)
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error: err } = await supabase.from('expenses').delete().eq('id', id)
    if (err) setError(err.message)
  }, [])

  return { expenses, addExpense, updateExpense, deleteExpense, loading, error }
}

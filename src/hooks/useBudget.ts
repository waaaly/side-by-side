'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export function useBudget(pairId: string | null) {
  const [total, setTotal] = useState(5000)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pairId) return
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('pairs')
        .select('budget_total, budget_categories')
        .eq('id', pairId)
        .single()
      if (data) {
        const row = data as { budget_total: number; budget_categories: Record<string, number> | null }
        setTotal(row.budget_total ?? 5000)
        setCategoryBudgets(row.budget_categories)
      }
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`budget:${pairId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pairs', filter: `id=eq.${pairId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pairId])

  const updateBudget = useCallback(async (newTotal: number, categories?: Record<string, number>) => {
    if (!pairId) return
    const supabase = createClient()
    await supabase
      .from('pairs')
      .update({ budget_total: newTotal, budget_categories: categories ?? null } as never)
      .eq('id', pairId)
    setTotal(newTotal)
    if (categories) setCategoryBudgets(categories)
  }, [pairId])

  return { total, categoryBudgets, updateBudget, loading }
}

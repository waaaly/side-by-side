'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { ShoppingItem } from '@/types'

export function useShoppingList(pairId: string | null) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pairId) return
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('pair_id', pairId)
        .order('created_at', { ascending: true })
      setItems((data ?? []) as unknown as ShoppingItem[])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`shopping:${pairId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_list', filter: `pair_id=eq.${pairId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pairId])

  const addItem = useCallback(async (name: string, note?: string) => {
    if (!pairId) return null
    const supabase = createClient()
    const { data } = await supabase
      .from('shopping_list')
      .insert({ pair_id: pairId, name, note })
      .select()
      .single()
    return data as unknown as ShoppingItem | null
  }, [pairId])

  const toggleItem = useCallback(async (id: string, completed: boolean) => {
    const supabase = createClient()
    await supabase.from('shopping_list').update({ completed }).eq('id', id)
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('shopping_list').delete().eq('id', id)
  }, [])

  const batchAddItems = useCallback(async (names: string[]) => {
    if (!pairId || names.length === 0) return
    const supabase = createClient()
    const existing = items.map((i) => i.name)
    const newItems = names.filter((n) => !existing.includes(n))
    if (newItems.length === 0) return
    await supabase
      .from('shopping_list')
      .insert(newItems.map((name) => ({ pair_id: pairId, name })))
  }, [pairId, items])

  return { items, addItem, toggleItem, deleteItem, batchAddItems, loading }
}

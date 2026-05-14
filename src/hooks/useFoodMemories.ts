'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { FoodMemory } from '@/types'

function toFoodMemory(row: Record<string, unknown>): FoodMemory {
  return {
    id: row.id as string,
    recipeId: row.recipe_id as string | undefined,
    recipeName: row.recipe_name as string,
    emoji: row.emoji as string,
    date: row.date as string,
    note: row.note as string | undefined,
  }
}

export function useFoodMemories(pairId: string | null) {
  const [memories, setMemories] = useState<FoodMemory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pairId) return
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('food_memories')
        .select('*')
        .eq('pair_id', pairId)
        .order('date', { ascending: false })
      setMemories((data ?? []).map(toFoodMemory))
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`memories:${pairId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_memories', filter: `pair_id=eq.${pairId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pairId])

  const addMemory = useCallback(async (data: {
    recipeName: string; emoji: string; note?: string; date: string
  }) => {
    if (!pairId) return null
    const supabase = createClient()
    const { data: created } = await supabase
      .from('food_memories')
      .insert({ pair_id: pairId, recipe_name: data.recipeName, emoji: data.emoji, note: data.note ?? null, date: data.date })
      .select()
      .single()
    return created ? toFoodMemory(created as Record<string, unknown>) : null
  }, [pairId])

  const deleteMemory = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('food_memories').delete().eq('id', id)
  }, [])

  return { memories, addMemory, deleteMemory, loading }
}

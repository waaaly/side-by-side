'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Recipe } from '@/types'

export function useRecipes(pairId: string | null) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pairId) return
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .eq('pair_id', pairId)
        .order('created_at', { ascending: false })
      setRecipes((data ?? []) as unknown as Recipe[])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`recipes:${pairId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes', filter: `pair_id=eq.${pairId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pairId])

  const addRecipe = useCallback(async (data: {
    name: string; emoji: string; ingredients: string[]; tags?: string[]
  }) => {
    if (!pairId) return null
    const supabase = createClient()
    const { data: created } = await supabase
      .from('recipes')
      .insert({ pair_id: pairId, ...data })
      .select()
      .single()
    return created as unknown as Recipe | null
  }, [pairId])

  const updateRecipe = useCallback(async (id: string, updates: {
    name?: string; emoji?: string; ingredients?: string[]; tags?: string[]
  }) => {
    const supabase = createClient()
    await supabase.from('recipes').update(updates).eq('id', id)
  }, [])

  const deleteRecipe = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('recipes').delete().eq('id', id)
  }, [])

  return { recipes, addRecipe, updateRecipe, deleteRecipe, loading }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Recipe, RecipeIngredient } from '@/types'

function toRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    name: row.name as string,
    difficulty: (row.difficulty as string) ?? undefined,
    category: (row.category as string) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    ingredients: (row.ingredients ?? []) as RecipeIngredient[],
    steps: (row.steps ?? []) as string[],
    createdAt: row.created_at as string,
  }
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
      setRecipes((data ?? []).map(toRecipe))
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('recipes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addRecipe = useCallback(async (data: {
    name: string
    difficulty?: string
    category?: string
    tags?: string[]
    ingredients: RecipeIngredient[]
    steps: string[]
  }) => {
    const supabase = createClient()
    const { data: created } = await supabase
      .from('recipes')
      .insert(data)
      .select()
      .single()
    return created ? toRecipe(created as Record<string, unknown>) : null
  }, [])

  const updateRecipe = useCallback(async (id: string, updates: {
    name?: string
    difficulty?: string | null
    category?: string | null
    tags?: string[]
    ingredients?: RecipeIngredient[]
    steps?: string[]
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

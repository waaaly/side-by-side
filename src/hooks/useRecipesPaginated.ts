'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Recipe, RecipeIngredient } from '@/types'

export interface RecipeFilters {
  category?: string
  difficulty?: string
  tag?: string
  search?: string
  sort?: 'created_at' | 'name'
}

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

export function useRecipesPaginated(filters: RecipeFilters, page: number, pageSize = 20) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('recipes').select('*', { count: 'exact' })

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters.tag) {
      query = query.contains('tags', [filters.tag])
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%`)
    }

    const sortCol = filters.sort ?? 'created_at'
    query = query.order(sortCol, { ascending: sortCol === 'name' })

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, count } = await query
    setRecipes((data ?? []).map(toRecipe))
    setTotalCount(count ?? 0)
    setLoading(false)
  }, [filters, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const deleteRecipe = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('recipes').delete().eq('id', id)
    load()
  }, [load])

  return { recipes, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / pageSize)), loading, deleteRecipe, reload: load }
}

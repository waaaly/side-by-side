'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { RecipeRating } from '@/types'

function toRating(row: Record<string, unknown>): RecipeRating {
  return {
    id: row.id as string,
    recipeId: row.recipe_id as string,
    createdBy: (row.created_by as string) as 'me' | 'partner',
    rating: row.rating as number,
    comment: (row.comment as string) ?? undefined,
    date: row.date as string,
    createdAt: row.created_at as string,
  }
}

export function useRecipeRatings(recipeId?: string | null) {
  const [ratings, setRatings] = useState<RecipeRating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recipeId) return
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('recipe_ratings')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })
      setRatings((data ?? []).map(toRating))
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`ratings:${recipeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipe_ratings', filter: `recipe_id=eq.${recipeId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [recipeId])

  const addRating = useCallback(async (data: {
    recipeId: string
    createdBy: 'me' | 'partner'
    rating: number
    comment?: string
  }) => {
    const supabase = createClient()
    const { data: created } = await supabase
      .from('recipe_ratings')
      .insert({
        recipe_id: data.recipeId,
        created_by: data.createdBy,
        rating: data.rating,
        comment: data.comment ?? null,
      })
      .select()
      .single()
    return created ? toRating(created as Record<string, unknown>) : null
  }, [])

  return { ratings, addRating, loading }
}

export function useAllRatings() {
  const [ratings, setRatings] = useState<RecipeRating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('recipe_ratings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setRatings((data ?? []).map(toRating))
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('ratings:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipe_ratings' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addRating = useCallback(async (data: {
    recipeId: string
    createdBy: 'me' | 'partner'
    rating: number
    comment?: string
  }) => {
    const supabase = createClient()
    const { data: created } = await supabase
      .from('recipe_ratings')
      .insert({
        recipe_id: data.recipeId,
        created_by: data.createdBy,
        rating: data.rating,
        comment: data.comment ?? null,
      })
      .select()
      .single()
    return created ? toRating(created as Record<string, unknown>) : null
  }, [])

  return { ratings, addRating, loading }
}

import { createClient } from './supabase'
import type { Expense, Recipe, ShoppingItem, FoodMemory, CalendarEvent, Pair } from '@/types'

function supabase() {
  return createClient()
}

/* ─── Pairs ─────────────────────────────────── */

export async function getPair(pairId: string): Promise<Pair | null> {
  const { data } = await supabase()
    .from('pairs')
    .select('*')
    .eq('id', pairId)
    .single()
  return data
}

export async function getPairByCode(code: string): Promise<Pair | null> {
  const { data } = await supabase()
    .from('pairs')
    .select('*')
    .eq('pair_code', code)
    .single()
  return data
}

export async function createPair(memberId: string): Promise<Pair | null> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const { data } = await supabase()
    .from('pairs')
    .insert({ pair_code: code, members: [memberId] })
    .select()
    .single()
  return data
}

export async function joinPair(code: string, memberId: string): Promise<Pair | null> {
  const pair = await getPairByCode(code)
  if (!pair) return null
  const { data } = await supabase()
    .from('pairs')
    .update({ members: [...pair.members, memberId] })
    .eq('id', pair.id)
    .select()
    .single()
  return data
}

/* ─── Budget ─────────────────────────────────── */

export async function getBudget(pairId: string) {
  const { data } = await supabase()
    .from('pairs')
    .select('budget_total, budget_categories')
    .eq('id', pairId)
    .single()
  return data
}

export async function updateBudget(pairId: string, total: number, categories?: Record<string, number>) {
  const { data } = await supabase()
    .from('pairs')
    .update({ budget_total: total, budget_categories: categories ?? null })
    .eq('id', pairId)
    .select()
    .single()
  return data
}

/* ─── Expenses ───────────────────────────────── */

export async function fetchExpenses(pairId: string): Promise<Expense[]> {
  const { data } = await supabase()
    .from('expenses')
    .select('*')
    .eq('pair_id', pairId)
    .order('date', { ascending: false })
  return (data ?? []) as unknown as Expense[]
}

export async function createExpense(
  pairId: string,
  expense: { amount: number; category: string; description: string; date: string },
): Promise<Expense | null> {
  const { data } = await supabase()
    .from('expenses')
    .insert({ pair_id: pairId, ...expense })
    .select()
    .single()
  return data as unknown as Expense | null
}

export async function updateExpense(
  id: string,
  updates: { amount?: number; category?: string; description?: string; date?: string },
): Promise<Expense | null> {
  const { data } = await supabase()
    .from('expenses')
    .update({ ...updates, last_edited_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return data as unknown as Expense | null
}

export async function deleteExpense(id: string): Promise<void> {
  await supabase().from('expenses').delete().eq('id', id)
}

/* ─── Recipes ────────────────────────────────── */

export async function fetchRecipes(pairId: string): Promise<Recipe[]> {
  const { data } = await supabase()
    .from('recipes')
    .select('*')
    .eq('pair_id', pairId)
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as Recipe[]
}

export async function createRecipe(
  pairId: string,
  recipe: { name: string; emoji: string; ingredients: string[]; tags?: string[] },
): Promise<Recipe | null> {
  const { data } = await supabase()
    .from('recipes')
    .insert({ pair_id: pairId, ...recipe })
    .select()
    .single()
  return data as unknown as Recipe | null
}

export async function updateRecipe(
  id: string,
  updates: { name?: string; emoji?: string; ingredients?: string[]; tags?: string[] },
): Promise<Recipe | null> {
  const { data } = await supabase()
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return data as unknown as Recipe | null
}

export async function deleteRecipe(id: string): Promise<void> {
  await supabase().from('recipes').delete().eq('id', id)
}

/* ─── Shopping List ─────────────────────────── */

export async function fetchShoppingList(pairId: string): Promise<ShoppingItem[]> {
  const { data } = await supabase()
    .from('shopping_list')
    .select('*')
    .eq('pair_id', pairId)
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as ShoppingItem[]
}

export async function createShoppingItem(
  pairId: string,
  item: { name: string; note?: string },
): Promise<ShoppingItem | null> {
  const { data } = await supabase()
    .from('shopping_list')
    .insert({ pair_id: pairId, ...item })
    .select()
    .single()
  return data as unknown as ShoppingItem | null
}

export async function toggleShoppingItem(id: string, completed: boolean): Promise<void> {
  await supabase()
    .from('shopping_list')
    .update({ completed })
    .eq('id', id)
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await supabase().from('shopping_list').delete().eq('id', id)
}

/* ─── Food Memories ─────────────────────────── */

export async function fetchFoodMemories(pairId: string): Promise<FoodMemory[]> {
  const { data } = await supabase()
    .from('food_memories')
    .select('*')
    .eq('pair_id', pairId)
    .order('date', { ascending: false })
  return (data ?? []) as unknown as FoodMemory[]
}

export async function createFoodMemory(
  pairId: string,
  memory: { recipe_id?: string; recipe_name: string; emoji: string; note?: string; date: string },
): Promise<FoodMemory | null> {
  const { data } = await supabase()
    .from('food_memories')
    .insert({ pair_id: pairId, ...memory })
    .select()
    .single()
  return data as unknown as FoodMemory | null
}

export async function deleteFoodMemory(id: string): Promise<void> {
  await supabase().from('food_memories').delete().eq('id', id)
}

/* ─── Calendar Events ────────────────────────── */

export async function fetchCalendarEvents(pairId: string): Promise<CalendarEvent[]> {
  const { data } = await supabase()
    .from('calendar_events')
    .select('*')
    .eq('pair_id', pairId)
    .order('date', { ascending: true })
  return (data ?? []) as unknown as CalendarEvent[]
}

export async function createCalendarEvent(
  pairId: string,
  event: {
    type: string
    title: string
    date: string
    repeat?: boolean
    note?: string
  },
): Promise<CalendarEvent | null> {
  const { data } = await supabase()
    .from('calendar_events')
    .insert({ pair_id: pairId, ...event })
    .select()
    .single()
  return data as unknown as CalendarEvent | null
}

export async function updateCalendarEvent(
  id: string,
  updates: { type?: string; title?: string; date?: string; repeat?: boolean; note?: string },
): Promise<CalendarEvent | null> {
  const { data } = await supabase()
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return data as unknown as CalendarEvent | null
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await supabase().from('calendar_events').delete().eq('id', id)
}

/* ─── AI Reports ─────────────────────────────── */

export async function fetchAiReports(pairId: string, type?: string) {
  let query = supabase()
    .from('ai_reports')
    .select('*')
    .eq('pair_id', pairId)
    .order('created_at', { ascending: false })
  if (type) query = query.eq('type', type)
  const { data } = await query
  return data ?? []
}

export async function createAiReport(
  pairId: string,
  report: { type: string; content: string; related_data?: Record<string, unknown> },
) {
  const { data } = await supabase()
    .from('ai_reports')
    .insert({ pair_id: pairId, ...report })
    .select()
    .single()
  return data
}

export async function updateAiReportFeedback(id: string, feedback: 'thumbs_up' | 'thumbs_down') {
  await supabase()
    .from('ai_reports')
    .update({ user_feedback: feedback })
    .eq('id', id)
}

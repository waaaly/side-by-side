export type ExpenseCategory =
  | 'dining' | 'vegetable' | 'fruit' | 'beverage' | 'alcohol' | 'snack'
  | 'rent' | 'home' | 'daily' | 'communication' | 'utility'
  | 'transit' | 'car' | 'travel' | 'hotel'
  | 'general' | 'clothing' | 'beauty' | 'digital' | 'electronics' | 'entertainment' | 'sports' | 'social'
  | 'books' | 'learning'
  | 'elderly' | 'children' | 'giftMoney' | 'pet'
  | 'medical' | 'delivery' | 'internet' | 'finance'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string
  createdBy?: 'me' | 'partner'
}

export interface Budget {
  total: number
  spent: number
  month: string
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  ingredients: string[]
  tags?: string[]
}

export interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  note?: string
}

export interface FoodMemory {
  id: string
  recipeId?: string
  recipeName: string
  emoji: string
  date: string
  note?: string
}

export interface CalendarEvent {
  id: string
  type: 'period_start' | 'period_end' | 'anniversary' | 'birthday' | 'schedule'
  title: string
  date: string
  repeat?: boolean
  note?: string
}

export interface Pair {
  id: string
  pair_code: string
  members: string[]
  budget_total: number
  budget_categories: Record<string, number> | null
  created_at: string
  updated_at: string
}

export interface ExpenseFormData {
  amount: number
  category: ExpenseCategory
  description: string
  date: string
  createdBy?: 'me' | 'partner'
}

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

export interface ExpenseFormData {
  amount: number
  category: ExpenseCategory
  description: string
  date: string
}

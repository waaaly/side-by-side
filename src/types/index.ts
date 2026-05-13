export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'housing'
  | 'health'
  | 'gift'
  | 'other'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string
  paidBy: 'me' | 'partner' | 'shared'
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
}

export interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  note?: string
}

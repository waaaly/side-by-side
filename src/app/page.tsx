'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, TrendingUp } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AddExpenseModal from '@/components/AddExpenseModal'
import { getCategory, getGroup } from '@/data/categories'
import type { Expense, ExpenseFormData } from '@/types'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

function getWeekday(dateStr: string): string {
  return weekdays[new Date(dateStr + 'T00:00:00').getDay()]
}

function todayString(): string {
  const d = new Date()
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function groupByDate(expenses: Expense[]): [string, Expense[]][] {
  const map = new Map<string, Expense[]>()
  for (const exp of expenses) {
    const arr = map.get(exp.date) || []
    arr.push(exp)
    map.set(exp.date, arr)
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const mockExpenses: Expense[] = [
  { id: '1', amount: 45, category: 'dining', description: '午餐·牛肉面', date: '2026-05-14' },
  { id: '2', amount: 6, category: 'transit', description: '地铁往返', date: '2026-05-14' },
  { id: '3', amount: 299, category: 'clothing', description: '情侣T恤', date: '2026-05-13' },
  { id: '4', amount: 88, category: 'entertainment', description: '电影票×2', date: '2026-05-12' },
  { id: '5', amount: 15, category: 'beverage', description: '奶茶', date: '2026-05-12' },
  { id: '6', amount: 3500, category: 'rent', description: '本月房租', date: '2026-05-01' },
  { id: '7', amount: 120, category: 'general', description: '超市采购', date: '2026-05-10' },
  { id: '8', amount: 200, category: 'dining', description: '周末约会晚餐', date: '2026-05-09' },
  { id: '9', amount: 32, category: 'snack', description: '薯片+可乐', date: '2026-05-08' },
  { id: '10', amount: 80, category: 'transit', description: '打车回家', date: '2026-05-07' },
]

const budget = { total: 5000, spent: 2650, month: '2026-05' }
const percentage = budget.spent / budget.total

function getBudgetColor(pct: number): string {
  if (pct <= 0.8) return 'bg-emerald-500'
  if (pct <= 1.0) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function BudgetPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [modalKey, setModalKey] = useState(0)
  const [showDailySummary, setShowDailySummary] = useState(true)
  const [expenses, setExpenses] = useState(mockExpenses)
  const [currentMonth] = useState('2026-05')

  const today = todayString()
  const todayExpenses = expenses.filter((e) => e.date === today)
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0)
  const sortedExpenses = groupByDate(expenses)

  const handleSave = useCallback(
    (data: ExpenseFormData) => {
      if (editExpense) {
        setExpenses((prev) =>
          prev.map((e) =>
            e.id === editExpense.id
              ? { ...e, amount: data.amount, category: data.category, description: data.description, date: data.date }
              : e,
          ),
        )
      } else {
        const newExpense: Expense = {
          id: `e${Date.now()}`,
          ...data,
        }
        setExpenses((prev) => [newExpense, ...prev])
      }
      setEditExpense(null)
      setIsModalOpen(false)
    },
    [editExpense],
  )

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditExpense(null)
    setModalKey((k) => k + 1)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditExpense(null)
    setIsModalOpen(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h1 className="text-xl font-bold text-brand-text">💰 记账</h1>
            <p className="text-xs text-gray-400 mt-0.5">记录我们的每一笔</p>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm">
            <TrendingUp size={14} className="text-brand-sage" />
            <span className="text-xs text-gray-500 tabular">
              本月 {expenses.length} 笔
            </span>
          </div>
        </motion.div>

        {/* Budget Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-brand-pink to-brand-rose rounded-3xl p-5 mb-4 text-white shadow-lg shadow-brand-pink/20"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-sm font-medium">本月预算</span>
            <span className="text-white/60 text-xs">{currentMonth.slice(0, 7)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-3xl font-bold">
                ¥{budget.spent.toLocaleString()}
                <span className="text-lg font-normal text-white/60">
                  /{budget.total.toLocaleString()}
                </span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/70 text-xs">
                  还剩 ¥{(budget.total - budget.spent).toLocaleString()}
                </span>
                {percentage > 1 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    已超支
                  </span>
                )}
              </div>
              <div className="mt-3 h-2 bg-white/25 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${getBudgetColor(percentage)}`}
                />
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <motion.circle
                  cx="44" cy="44" r="36"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 36}
                  initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 36 * (1 - Math.min(percentage, 1)),
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  transform="rotate(-90 44 44)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${percentage > 1 ? 'text-white' : 'text-white'}`}>
                  {Math.round(percentage * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Summary */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setShowDailySummary(!showDailySummary)}
            className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 mb-4 shadow-sm active:scale-[0.98] transition"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📊</span>
              <span className="text-sm text-gray-600">
                今日支出 <span className="font-semibold text-brand-text tabular">¥{todayTotal}</span>
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">
                本月 <span className="tabular">{expenses.length}</span> 笔
              </span>
            </div>
            <motion.div
              animate={{ rotate: showDailySummary ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-gray-300" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showDailySummary && todayExpenses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm space-y-2">
                  {todayExpenses.map((exp) => {
                    const cat = getCategory(exp.category)
                    return (
                      <div key={exp.id} className="flex items-center gap-2 text-sm">
                        <span>{cat?.emoji || '📝'}</span>
                        <span className="flex-1 text-gray-500 truncate">{exp.description}</span>
                        <span className="font-medium text-brand-text tabular">-¥{exp.amount}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Date-grouped Expense List */}
        <div className="mb-20">
          <h2 className="text-sm font-semibold text-brand-text mb-3">📋 最近流水</h2>
          <div className="space-y-3">
            {sortedExpenses.map(([date, items]) => {
              const dayTotal = items.reduce((sum, e) => sum + e.amount, 0)
              return (
                <div key={date}>
                  {/* Sticky Date Header */}
                  <div className="sticky top-0 z-10 bg-brand-cream pb-1 pt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        {formatDate(date)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        星期{getWeekday(date)}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 tabular">
                      ¥{dayTotal}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((exp) => {
                      const cat = getCategory(exp.category)
                      const group = cat ? getGroup(cat.groupId) : null
                      return (
                        <motion.button
                          key={exp.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleEdit(exp)}
                          className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition hover:bg-gray-50/50"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                              group?.bgColor || 'bg-gray-100'
                            }`}
                          >
                            {cat?.emoji || '📝'}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-brand-text truncate">
                              {exp.description || cat?.label || exp.category}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {cat?.label || exp.category}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-brand-text tabular flex-shrink-0">
                            -¥{exp.amount}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav onAddExpense={handleAddNew} />

      <AddExpenseModal
        key={editExpense?.id || `new-${modalKey}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editExpense={editExpense}
      />
    </div>
  )
}

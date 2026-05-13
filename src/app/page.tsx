'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  Heart,
  Gift,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import AddExpenseModal from '@/components/AddExpenseModal'
import type { Expense, ExpenseCategory } from '@/types'

const categoryIcon: Record<ExpenseCategory, typeof Utensils> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Gamepad2,
  housing: Home,
  health: Heart,
  gift: Gift,
  other: MoreHorizontal,
}

const categoryColor: Record<ExpenseCategory, string> = {
  food: 'text-orange-400 bg-orange-50',
  transport: 'text-blue-400 bg-blue-50',
  shopping: 'text-purple-400 bg-purple-50',
  entertainment: 'text-pink-400 bg-pink-50',
  housing: 'text-amber-400 bg-amber-50',
  health: 'text-red-400 bg-red-50',
  gift: 'text-rose-400 bg-rose-50',
  other: 'text-gray-400 bg-gray-50',
}

const mockExpenses: Expense[] = [
  { id: '1', amount: 45, category: 'food', description: '午餐·牛肉面', date: '2026-05-13', paidBy: 'me' },
  { id: '2', amount: 6, category: 'transport', description: '地铁', date: '2026-05-13', paidBy: 'partner' },
  { id: '3', amount: 299, category: 'shopping', description: '情侣T恤', date: '2026-05-12', paidBy: 'shared' },
  { id: '4', amount: 88, category: 'entertainment', description: '电影票×2', date: '2026-05-11', paidBy: 'me' },
  { id: '5', amount: 15, category: 'food', description: '奶茶', date: '2026-05-11', paidBy: 'partner' },
  { id: '6', amount: 3500, category: 'housing', description: '本月房租', date: '2026-05-01', paidBy: 'shared' },
  { id: '7', amount: 120, category: 'gift', description: '小花束', date: '2026-05-10', paidBy: 'me' },
]

const budget = { total: 5000, spent: 2650, month: '2026-05' }
const percentage = budget.spent / budget.total

const circles = [
  { cx: 80, cy: 80, r: 64 },
]

export default function BudgetPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const radius = 56
  const circumference = 2 * Math.PI * radius

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
            <span className="text-xs text-gray-500">本月已记 7 笔</span>
          </div>
        </motion.div>

        {/* Budget Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-brand-pink to-brand-rose rounded-3xl p-5 mb-5 text-white shadow-lg shadow-brand-pink/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium">本月预算</p>
              <p className="text-3xl font-bold mt-1">
                ¥{budget.spent.toLocaleString()}
                <span className="text-lg font-normal text-white/60">
                  /{budget.total.toLocaleString()}
                </span>
              </p>
              <p className="text-white/70 text-xs mt-2">
                还剩 ¥{(budget.total - budget.spent).toLocaleString()}
              </p>
              <div className="mt-3 h-2 bg-white/25 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
            <div className="relative flex-shrink-0 ml-4">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset: circumference * (1 - Math.min(percentage, 1)),
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {Math.round(percentage * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-brand-text">📋 最近流水</h2>
            <button className="text-xs text-brand-pink font-medium active:scale-95 transition">
              查看全部
            </button>
          </div>
          <div className="space-y-2">
            {mockExpenses.map((expense, i) => {
              const Icon = categoryIcon[expense.category]
              const colorClass = categoryColor[expense.category]
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {expense.date.slice(5)} · {expense.paidBy === 'me' ? '我' : expense.paidBy === 'partner' ? 'TA' : '共同'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-text">
                    -¥{expense.amount}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div
        className="flex justify-center"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-pink to-brand-rose text-white shadow-lg shadow-brand-pink/30 flex items-center justify-center -mt-7 z-10"
        >
          <Plus size={26} />
        </motion.button>
      </div>

      <BottomNav />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

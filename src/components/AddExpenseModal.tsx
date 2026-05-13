'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  Heart,
  Gift,
  MoreHorizontal,
} from 'lucide-react'
import type { ExpenseCategory } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const categories: { value: ExpenseCategory; label: string; icon: typeof Utensils }[] = [
  { value: 'food', label: '餐饮', icon: Utensils },
  { value: 'transport', label: '交通', icon: Car },
  { value: 'shopping', label: '购物', icon: ShoppingBag },
  { value: 'entertainment', label: '娱乐', icon: Gamepad2 },
  { value: 'housing', label: '居住', icon: Home },
  { value: 'health', label: '健康', icon: Heart },
  { value: 'gift', label: '礼物', icon: Gift },
  { value: 'other', label: '其他', icon: MoreHorizontal },
]

const paidByOptions = [
  { value: 'me' as const, label: '我' },
  { value: 'partner' as const, label: 'TA' },
  { value: 'shared' as const, label: '共同' },
]

export default function AddExpenseModal({ isOpen, onClose }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [description, setDescription] = useState('')
  const [paidBy, setPaidBy] = useState<'me' | 'partner' | 'shared'>('me')

  const handleSubmit = () => {
    if (!amount) return
    onClose()
    setAmount('')
    setDescription('')
    setCategory('food')
    setPaidBy('me')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-6 pb-8"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-brand-text">记一笔</h2>
              <button
                onClick={onClose}
                className="p-1 active:scale-95 transition"
              >
                <X size={22} className="text-gray-400" />
              </button>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl text-gray-300">¥</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 text-3xl font-semibold outline-none bg-transparent placeholder:text-gray-200"
                  autoFocus
                />
              </div>
              <input
                type="text"
                placeholder="备注（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-gray-500 outline-none bg-transparent placeholder:text-gray-300 border-b border-gray-100 pb-2"
              />
            </div>

            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-3">分类</p>
              <div className="grid grid-cols-4 gap-3">
                {categories.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl active:scale-95 transition ${
                      category === value
                        ? 'bg-brand-pink/10 text-brand-pink'
                        : 'text-gray-500'
                    }`}
                  >
                    <Icon
                      size={22}
                      className={
                        category === value ? 'text-brand-pink' : 'text-gray-400'
                      }
                    />
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-3">谁付的</p>
              <div className="flex gap-2">
                {paidByOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPaidBy(value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium active:scale-95 transition ${
                      paidBy === value
                        ? 'bg-brand-sage/20 text-brand-sage border border-brand-sage/30'
                        : 'bg-gray-50 text-gray-500 border border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40 disabled:active:scale-100"
            >
              确认添加
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

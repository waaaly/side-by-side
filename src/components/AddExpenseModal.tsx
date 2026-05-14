'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { CATEGORIES, CATEGORY_GROUPS, getGroup, getCategory } from '@/data/categories'
import type { ExpenseCategory, Expense, ExpenseFormData } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ExpenseFormData) => void
  editExpense?: Expense | null
}

type Stage = 'category' | 'amount'

export function todayString(): string {
  const d = new Date()
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export default function AddExpenseModal({ isOpen, onClose, onSave, editExpense }: Props) {
  const isEditing = !!editExpense
  const [stage, setStage] = useState<Stage>(isEditing ? 'amount' : 'category')
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | ''>(editExpense?.category || '')
  const [amount, setAmount] = useState(isEditing ? String(editExpense!.amount) : '')
  const [description, setDescription] = useState(editExpense?.description || '')
  const [date, setDate] = useState(isEditing ? editExpense!.date : todayString())

  const handleSelectCategory = (value: ExpenseCategory) => {
    setSelectedCategory(value)
    setStage('amount')
  }

  const handleBack = () => setStage('category')

  const handleSubmit = () => {
    if (!selectedCategory || !amount) return
    onSave({
      amount: Number(amount),
      category: selectedCategory as ExpenseCategory,
      description,
      date,
    })
  }

  const handleClose = () => {
    setStage('category')
    setSelectedCategory('')
    setAmount('')
    setDescription('')
    setDate(todayString())
    onClose()
  }

  const cat = selectedCategory ? getCategory(selectedCategory) : null
  const group = cat ? getGroup(cat.groupId) : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col max-h-[85vh]"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50 flex-shrink-0">
              <div className="w-8">
                {stage === 'amount' && (
                  <button onClick={handleBack} className="active:scale-95 transition">
                    <ChevronLeft size={22} className="text-gray-400" />
                  </button>
                )}
              </div>
              <h2 className="text-base font-semibold text-brand-text">
                {editExpense ? '编辑流水' : stage === 'category' ? '选择分类' : '输入金额'}
              </h2>
              <button onClick={handleClose} className="active:scale-95 transition">
                <X size={22} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="wait">
                {stage === 'category' && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {CATEGORY_GROUPS.map((g) => (
                      <div key={g.id} className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm">{g.emoji}</span>
                          <span className="text-xs font-semibold text-gray-500">{g.name}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {CATEGORIES.filter((c) => c.groupId === g.id).map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => handleSelectCategory(cat.value as ExpenseCategory)}
                              className="flex flex-col items-center gap-1 py-3 rounded-xl active:scale-90 transition bg-gray-50 hover:bg-gray-100"
                            >
                              <span className="text-xl leading-none">{cat.emoji}</span>
                              <span className="text-[10px] text-gray-600">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {stage === 'amount' && (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cat && (
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                            group?.bgColor || 'bg-gray-100'
                          }`}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-text">{cat.label}</p>
                          <p className="text-xs text-gray-400">{group?.name}</p>
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <div className="flex items-center gap-1 border-b border-gray-100 pb-3">
                        <span className="text-2xl text-gray-300 font-semibold">¥</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1 text-3xl font-semibold outline-none bg-transparent placeholder:text-gray-200 tabular"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <input
                        type="text"
                        placeholder="添加备注（可选）"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-sm text-gray-500 outline-none bg-transparent placeholder:text-gray-300 border-b border-gray-100 pb-2"
                      />
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <CalendarIcon size={14} />
                        <span>日期</span>
                      </div>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={todayString()}
                        className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!amount || !selectedCategory}
                      className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40 disabled:active:scale-100"
                    >
                      {editExpense ? '保存修改' : '确认添加'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, CATEGORY_GROUPS } from '@/data/categories'

export default function BudgetSettingsPage() {
  const [totalBudget, setTotalBudget] = useState('5000')
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({})
  const [showCategoryLimits, setShowCategoryLimits] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCategoryBudget = (value: string, val: string) => {
    setCategoryBudgets((prev) => {
      const next = { ...prev }
      if (val === '' || Number(val) <= 0) {
        delete next[value]
      } else {
        next[value] = val
      }
      return next
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings" className="active:scale-95 transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-brand-text">💰 预算设置</h1>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
          <label className="text-xs text-gray-400 mb-2 block">月度总预算</label>
          <div className="flex items-center gap-2">
            <span className="text-lg text-gray-300 font-semibold">¥</span>
            <input
              type="number"
              inputMode="numeric"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              min="1"
              className="flex-1 text-2xl font-semibold text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 tabular"
            />
          </div>
          {Number(totalBudget) <= 0 && (
            <p className="text-xs text-brand-coral mt-1">预算必须大于 0</p>
          )}
        </div>

        <button
          onClick={() => setShowCategoryLimits(!showCategoryLimits)}
          className="w-full flex items-center justify-between bg-white rounded-2xl px-5 py-3.5 mb-4 shadow-sm active:scale-[0.98] transition"
        >
          <span className="text-sm font-medium text-brand-text">📊 分类独立预算</span>
          <motion.div animate={{ rotate: showCategoryLimits ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-gray-300" />
          </motion.div>
        </button>

        {showCategoryLimits && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 space-y-3">
            <p className="text-xs text-gray-400 mb-2">为每个分类设定独立上限（留空表示不限制）</p>
            {CATEGORY_GROUPS.map((group) => {
              const groupCats = CATEGORIES.filter((c) => c.groupId === group.id)
              return (
                <div key={group.id}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">{group.emoji}</span>
                    <span className="text-xs font-medium text-gray-500">{group.name}</span>
                  </div>
                  <div className="space-y-2 ml-4">
                    {groupCats.map((cat) => (
                      <div key={cat.value} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-6 text-center">{cat.emoji}</span>
                        <span className="text-xs text-gray-500 w-12">{cat.label}</span>
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-xs text-gray-300">¥</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="不限"
                            value={categoryBudgets[cat.value] || ''}
                            onChange={(e) => handleCategoryBudget(cat.value, e.target.value)}
                            min="0"
                            className="flex-1 text-xs text-brand-text outline-none bg-gray-50 rounded-lg px-3 py-1.5 placeholder:text-gray-300 tabular"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={Number(totalBudget) <= 0}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40"
        >
          {saved ? '已保存 ✓' : '保存设置'}
        </button>
      </div>
    </div>
  )
}

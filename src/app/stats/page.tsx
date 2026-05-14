'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { getCategory, getGroup } from '@/data/categories'
import { useExpenses } from '@/hooks/useExpenses'
import { getStoredPairId } from '@/lib/pairing'
import type { Expense } from '@/types'

type PersonFilter = 'all' | 'me' | 'partner'
type PeriodFilter = 'week' | 'month' | 'quarter' | 'year'

const personOptions: { value: PersonFilter; label: string }[] = [
  { value: 'all', label: '双方' },
  { value: 'me', label: '我' },
  { value: 'partner', label: 'TA' },
]

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' },
  { value: 'year', label: '本年' },
]

export default function StatsPage() {
  const pairId = getStoredPairId()
  const { expenses } = useExpenses(pairId)

  const [person, setPerson] = useState<PersonFilter>('all')
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const [showPersonDropdown, setShowPersonDropdown] = useState(false)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  const filteredExpenses = useMemo(() => {
    return expenses
  }, [expenses])

  const totalSpent = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses],
  )

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { label: string; emoji: string; amount: number; groupId: string }>()
    for (const exp of filteredExpenses) {
      const cat = getCategory(exp.category)
      if (!cat) continue
      const existing = map.get(cat.value)
      if (existing) {
        existing.amount += exp.amount
      } else {
        map.set(cat.value, { label: cat.label, emoji: cat.emoji, amount: exp.amount, groupId: cat.groupId })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
  }, [filteredExpenses])

  const groupTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const exp of filteredExpenses) {
      const cat = getCategory(exp.category)
      if (!cat) continue
      map.set(cat.groupId, (map.get(cat.groupId) || 0) + exp.amount)
    }
    return Array.from(map.entries())
      .map(([id, amount]) => {
        const group = getGroup(id)
        return { id, name: group?.name || id, emoji: group?.emoji || '', amount }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [filteredExpenses])

  const maxCategoryAmount = Math.max(...categoryBreakdown.map((c) => c.amount), 1)

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="active:scale-95 transition">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <h1 className="text-xl font-bold text-brand-text">📊 消费统计</h1>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <button
              onClick={() => setShowPersonDropdown(!showPersonDropdown)}
              className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-2.5 text-sm shadow-sm active:scale-[0.98] transition"
            >
              <span className="text-brand-text">
                {personOptions.find((o) => o.value === person)?.label}
              </span>
              <ChevronDown size={14} className="text-gray-300" />
            </button>
            {showPersonDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-10 overflow-hidden">
                {personOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setPerson(opt.value); setShowPersonDropdown(false) }}
                    className={`w-full px-4 py-2.5 text-sm text-left active:scale-[0.98] transition ${
                      person === opt.value ? 'text-brand-pink font-medium bg-brand-pink/5' : 'text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-2.5 text-sm shadow-sm active:scale-[0.98] transition"
            >
              <span className="text-brand-text">
                {periodOptions.find((o) => o.value === period)?.label}
              </span>
              <ChevronDown size={14} className="text-gray-300" />
            </button>
            {showPeriodDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-10 overflow-hidden">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setPeriod(opt.value); setShowPeriodDropdown(false) }}
                    className={`w-full px-4 py-2.5 text-sm text-left active:scale-[0.98] transition ${
                      period === opt.value ? 'text-brand-pink font-medium bg-brand-pink/5' : 'text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-5 mb-4 shadow-sm"
        >
          <p className="text-xs text-gray-400 mb-1">总支出</p>
          <p className="text-3xl font-bold text-brand-text tabular">¥{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            共 {filteredExpenses.length} 笔 · 平均 ¥{(totalSpent / (filteredExpenses.length || 1)).toFixed(0)}
          </p>
        </motion.div>

        <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-text mb-4">分类汇总</h3>
          <div className="space-y-3">
            {groupTotals.map((g, i) => {
              const pct = totalSpent > 0 ? (g.amount / totalSpent) * 100 : 0
              const group = getGroup(g.id)
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{g.emoji}</span>
                      <span className="text-sm text-gray-600">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 tabular">{pct.toFixed(0)}%</span>
                      <span className="text-sm font-medium text-brand-text tabular">
                        ¥{g.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className={`h-full rounded-full ${group?.bgColor?.replace('bg-', 'bg-') || 'bg-gray-300'}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm mb-20">
          <h3 className="text-sm font-semibold text-brand-text mb-4">支出排行</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat, i) => {
              const pct = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0
              const barWidth = (cat.amount / maxCategoryAmount) * 100
              const group = getGroup(cat.groupId)
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-6 text-center text-xs text-gray-400 tabular">{i + 1}</span>
                  <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-600">{cat.label}</span>
                      <span className="text-xs font-medium text-brand-text tabular">
                        ¥{cat.amount}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${group?.bgColor?.replace('50', '300') || 'bg-gray-300'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 w-8 text-right tabular">{pct.toFixed(0)}%</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronUp, ChevronDown, Search } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, CATEGORY_GROUPS } from '@/data/categories'

export default function CategoriesSettingsPage() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(CATEGORIES.map((c) => c.value)))
  const [order, setOrder] = useState<string[]>(CATEGORIES.map((c) => c.value))
  const [search, setSearch] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(CATEGORY_GROUPS.map((g) => g.id)))

  const toggleEnabled = (value: string) => {
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const moveUp = (value: string) => {
    const idx = order.indexOf(value)
    if (idx <= 0) return
    const next = [...order]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setOrder(next)
  }

  const moveDown = (value: string) => {
    const idx = order.indexOf(value)
    if (idx >= order.length - 1) return
    const next = [...order]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setOrder(next)
  }

  const filteredGroups = useMemo(() => {
    return CATEGORY_GROUPS.map((g) => {
      const cats = order
        .map((v) => CATEGORIES.find((c) => c.value === v))
        .filter((c): c is typeof CATEGORIES[number] => c !== undefined && c.groupId === g.id)
        .filter((c) => !search || c.label.includes(search) || c.value.includes(search))
      return { ...g, cats }
    }).filter((g) => g.cats.length > 0)
  }, [order, search])

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings" className="active:scale-95 transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-brand-text">📂 分类管理</h1>
        </div>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="搜索分类..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm outline-none placeholder:text-gray-300 shadow-sm"
          />
        </div>

        <div className="space-y-3 mb-20">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-2">
                  <span>{group.emoji}</span>
                  <span className="text-sm font-semibold text-gray-600">{group.name}</span>
                  <span className="text-[10px] text-gray-400">
                    ({group.cats.filter((c) => enabled.has(c.value)).length}/{group.cats.length})
                  </span>
                </div>
                <ChevronUp
                  size={16}
                  className={`text-gray-300 transition-transform ${expandedGroups.has(group.id) ? '' : 'rotate-180'}`}
                />
              </button>

              {expandedGroups.has(group.id) && (
                <div className="px-3 pb-3 space-y-1">
                  {group.cats.map((cat) => {
                    const actualIdx = order.indexOf(cat.value)
                    return (
                      <div
                        key={cat.value}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                        <span
                          className={`flex-1 text-sm ${
                            enabled.has(cat.value) ? 'text-brand-text' : 'text-gray-300 line-through'
                          }`}
                        >
                          {cat.label}
                        </span>

                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveUp(cat.value)}
                            disabled={actualIdx === 0}
                            className="p-0.5 active:scale-90 transition disabled:opacity-20"
                          >
                            <ChevronUp size={12} className="text-gray-400" />
                          </button>
                          <button
                            onClick={() => moveDown(cat.value)}
                            disabled={actualIdx === order.length - 1}
                            className="p-0.5 active:scale-90 transition disabled:opacity-20"
                          >
                            <ChevronDown size={12} className="text-gray-400" />
                          </button>
                        </div>

                        <button
                          onClick={() => toggleEnabled(cat.value)}
                          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                            enabled.has(cat.value) ? 'bg-brand-pink' : 'bg-gray-200'
                          }`}
                        >
                          <motion.div
                            animate={{ x: enabled.has(cat.value) ? 18 : 2 }}
                            className="w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5"
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

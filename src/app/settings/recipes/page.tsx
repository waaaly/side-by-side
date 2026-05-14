'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Recipe } from '@/types'

const mockRecipes: Recipe[] = [
  { id: '1', name: '番茄炒蛋', emoji: '🍅', ingredients: ['番茄', '鸡蛋', '葱花'], tags: ['快手菜', '家常'] },
  { id: '2', name: '可乐鸡翅', emoji: '🍗', ingredients: ['鸡翅', '可乐', '姜片'], tags: ['荤菜'] },
  { id: '3', name: '麻婆豆腐', emoji: '🫘', ingredients: ['豆腐', '肉末', '豆瓣酱'], tags: ['辣', '下饭'] },
  { id: '4', name: '蒜蓉西兰花', emoji: '🥦', ingredients: ['西兰花', '蒜末'], tags: ['快手菜', '素菜'] },
  { id: '5', name: '红烧排骨', emoji: '🍖', ingredients: ['排骨', '酱油', '冰糖'], tags: ['荤菜', '下饭'] },
  { id: '6', name: '奶油蘑菇汤', emoji: '🥣', ingredients: ['蘑菇', '奶油', '黄油'], tags: ['西餐', '汤'] },
  { id: '7', name: '日式咖喱饭', emoji: '🍛', ingredients: ['咖喱块', '土豆', '胡萝卜', '鸡肉'], tags: ['下饭'] },
  { id: '8', name: '葱油拌面', emoji: '🍜', ingredients: ['面条', '小葱', '酱油'], tags: ['快手菜'] },
]

export default function RecipesSettingsPage() {
  const [recipes, setRecipes] = useState(mockRecipes)
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const s = new Set<string>()
    for (const r of recipes) r.tags?.forEach((t) => s.add(t))
    return Array.from(s).sort()
  }, [recipes])

  const filtered = useMemo(() => {
    let r = recipes
    if (search) {
      const q = search.toLowerCase()
      r = r.filter((rc) => rc.name.toLowerCase().includes(q))
    }
    if (selectedTag) r = r.filter((rc) => rc.tags?.includes(selectedTag))
    return r
  }, [recipes, search, selectedTag])

  const handleDelete = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings" className="active:scale-95 transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-brand-text">🍳 食谱管理</h1>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="搜索菜谱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm outline-none placeholder:text-gray-300 shadow-sm"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-full text-[10px] active:scale-90 transition ${
                !selectedTag ? 'bg-brand-amber text-white font-medium' : 'bg-white text-gray-400 shadow-sm'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-[10px] active:scale-90 transition ${
                  selectedTag === tag ? 'bg-brand-amber text-white font-medium' : 'bg-white text-gray-400 shadow-sm'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-1.5 mb-20">
          {filtered.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm"
            >
              <span className="text-xl">{recipe.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-text truncate">{recipe.name}</p>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {recipe.tags.map((t) => (
                      <span key={t} className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-300 mt-0.5">
                  {recipe.ingredients.join('、')}
                </p>
              </div>
              <button onClick={() => handleDelete(recipe.id)} className="p-1.5 active:scale-90 transition">
                <Trash2 size={14} className="text-gray-300" />
              </button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">没有匹配的菜谱</p>
          )}
        </div>
      </div>
    </div>
  )
}

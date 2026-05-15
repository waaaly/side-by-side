'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRecipesPaginated } from '@/hooks/useRecipesPaginated'
import type { RecipeFilters } from '@/hooks/useRecipesPaginated'
import type { Recipe } from '@/types'

const CATEGORY_EMOJI: Record<string, string> = {
  '家常菜': '🍳', '川菜': '🌶️', '湘菜': '🌶️', '粤菜': '🥟',
  '西餐': '🍝', '日料': '🍣', '韩餐': '🥘', '东南亚': '🍜',
  '甜品': '🍰', '烘焙': '🥐', '汤羹': '🥣', '沙拉': '🥗',
  '烧烤': '🥩', '早餐': '🥞', '面食': '🍜', '饮品': '🧋',
}

const CATEGORIES = ['', ...Object.keys(CATEGORY_EMOJI)]
const DIFFICULTIES = ['全部', '简单', '中等', '困难']

function recipeEmoji(recipe: { category?: string; name: string }): string {
  if (recipe.category && CATEGORY_EMOJI[recipe.category]) return CATEGORY_EMOJI[recipe.category]
  const match = recipe.name.match(/^(\p{Extended_Pictographic})/u)
  return match?.[1] ?? '🍳'
}

export default function RecipesSettingsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)

  const filters: RecipeFilters = useMemo(() => ({
    category: category || undefined,
    difficulty: difficulty || undefined,
    tag: tag || undefined,
    search: search || undefined,
    sort: 'created_at',
  }), [category, difficulty, tag, search])

  const { recipes, totalCount, totalPages, loading, deleteRecipe, reload } = useRecipesPaginated(filters, page, 20)

  const allTags = useMemo(() => {
    const s = new Set<string>()
    for (const r of recipes) r.tags?.forEach((t) => s.add(t))
    return Array.from(s).sort()
  }, [recipes])

  const handleDelete = async (id: string) => {
    await deleteRecipe(id)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const selectCategory = (c: string) => {
    setCategory(c)
    setPage(1)
  }

  const selectDifficulty = (d: string) => {
    setDifficulty(d === '全部' ? '' : d)
    setPage(1)
  }

  const selectTag = (t: string) => {
    setTag(t === tag ? '' : t)
    setPage(1)
  }

  return (
    <div className="px-5 pt-3 pb-2 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/settings" className="active:scale-95 transition">
          <ArrowLeft size={20} className="text-gray-400" />
        </Link>
        <h1 className="text-xl font-bold text-brand-text">🍳 食谱管理</h1>
        {!loading && (
          <span className="text-[10px] text-gray-300 ml-auto">共 {totalCount} 道</span>
        )}
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="搜索菜谱..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm outline-none placeholder:text-gray-300 shadow-sm"
        />
      </div>

      <div className="overflow-x-auto mb-3 scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c || 'all'}
              onClick={() => selectCategory(c)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] active:scale-90 transition ${
                category === c
                  ? 'bg-brand-amber text-white font-medium shadow-sm'
                  : 'bg-white text-gray-400 shadow-sm'
              }`}
            >
              {c ? `${CATEGORY_EMOJI[c]} ${c}` : '🍽️ 全部'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => selectDifficulty(d)}
            className={`px-2.5 py-1 rounded-full text-[10px] active:scale-90 transition ${
              (difficulty || '全部') === d
                ? 'bg-brand-amber text-white font-medium'
                : 'bg-white text-gray-400 shadow-sm'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => selectTag(t)}
              className={`px-2.5 py-1 rounded-full text-[10px] active:scale-90 transition ${
                tag === t
                  ? 'bg-brand-amber text-white font-medium'
                  : 'bg-white text-gray-400 shadow-sm'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5 mb-4">
        {loading ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-brand-amber border-t-transparent rounded-full mx-auto"
            />
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={handleDelete}
            />
          ))
        )}
        {!loading && recipes.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">没有匹配的菜谱</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-full bg-white shadow-sm active:scale-90 transition disabled:opacity-30"
          >
            <ChevronLeft size={14} className="text-gray-400" />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (page <= 4) {
              pageNum = i + 1
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = page - 3 + i
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-7 h-7 rounded-full text-[11px] font-medium active:scale-90 transition ${
                  page === pageNum
                    ? 'bg-brand-amber text-white'
                    : 'bg-white text-gray-400 shadow-sm'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-full bg-white shadow-sm active:scale-90 transition disabled:opacity-30"
          >
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        </div>
      )}
    </div>
  )
}

function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl px-4 py-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{recipeEmoji(recipe)}</span>
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <p className="text-sm font-medium text-brand-text truncate">{recipe.name}</p>
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {recipe.category && (
              <span className="text-[9px] text-brand-amber bg-amber-50 px-1.5 py-0.5 rounded-full">
                {recipe.category}
              </span>
            )}
            {recipe.difficulty && (
              <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                {recipe.difficulty}
              </span>
            )}
            <span className="text-[9px] text-gray-300">
              {recipe.ingredients.length}种食材{recipe.steps.length > 0 ? ` · ${recipe.steps.length}步` : ''}
            </span>
          </div>
        </button>
        <button onClick={() => onDelete(recipe.id)} className="p-1.5 active:scale-90 transition">
          <Trash2 size={14} className="text-gray-300" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-gray-50 mt-3 space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 mb-1 font-medium">食材</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full"
                    >
                      {ing.name}{ing.amount ? ` ${ing.amount}` : ''}
                    </span>
                  ))}
                </div>
              </div>
              {recipe.steps.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-1 font-medium">步骤</p>
                  <ol className="space-y-1">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="text-[10px] text-gray-500 flex gap-1.5">
                        <span className="text-gray-300 min-w-[1rem]">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

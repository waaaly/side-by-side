'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Star, Swords, CheckCircle } from 'lucide-react'
import type { Recipe, RecipeRating, CookingChallenge } from '@/types'

const CATEGORY_EMOJI: Record<string, string> = {
  '家常菜': '🍳', '川菜': '🌶️', '湘菜': '🌶️', '粤菜': '🥟',
  '西餐': '🍝', '日料': '🍣', '韩餐': '🥘', '东南亚': '🍜',
  '甜品': '🍰', '烘焙': '🥐', '汤羹': '🥣', '沙拉': '🥗',
  '烧烤': '🥩', '早餐': '🥞', '面食': '🍜', '饮品': '🧋',
}

function recipeEmoji(recipe: { category?: string; name: string }): string {
  if (recipe.category && CATEGORY_EMOJI[recipe.category]) return CATEGORY_EMOJI[recipe.category]
  const match = recipe.name.match(/^(\p{Extended_Pictographic})/u)
  return match?.[1] ?? '🍳'
}

function recipeById(recipes: Recipe[], id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id)
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

interface Props {
  recipes: Recipe[]
  ratings: RecipeRating[]
  challenges: CookingChallenge[]
  onChallenge?: (recipe: Recipe) => void
}

export default function KitchenFeed({ recipes, ratings, challenges, onChallenge }: Props) {
  const feed = useMemo(() => {
    const items: { date: string; content: React.ReactNode; key: string }[] = []

    for (const r of ratings) {
      const recipe = recipeById(recipes, r.recipeId)
      if (!recipe) continue
      items.push({
        date: r.createdAt,
        key: `rating-${r.id}`,
        content: (
          <div className="flex items-center gap-3">
            <span className="text-xl">{recipeEmoji(recipe)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-text">
                <span className="font-medium">{r.createdBy === 'me' ? '你' : '对方'}</span>
                {' 做了 '}
                <span className="font-medium">{recipe.name}</span>
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={i < r.rating ? 'fill-brand-amber text-brand-amber' : 'text-gray-200'}
                  />
                ))}
                {r.comment && (
                  <span className="text-[10px] text-gray-400 ml-1 truncate">"{r.comment}"</span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-gray-300 whitespace-nowrap">{timeAgo(r.createdAt)}</span>
          </div>
        ),
      })
    }

    for (const c of challenges) {
      const recipe = recipeById(recipes, c.recipeId)
      if (!recipe) continue
      const actionText = c.status === 'completed'
        ? `${c.fromUser === 'me' ? '你' : '对方'} 完成了 ${c.toUser === 'me' ? '你' : '对方'} 的挑战`
        : `${c.fromUser === 'me' ? '你' : '对方'} 挑战 ${c.toUser === 'me' ? '你' : '对方'} 做`
      items.push({
        date: c.completedAt ?? c.createdAt,
        key: `challenge-${c.id}`,
        content: (
          <div className="flex items-center gap-3">
            <span className="text-xl">{recipeEmoji(recipe)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-text">
                {actionText}
                <span className="font-medium"> {recipe.name}</span>
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {c.status === 'completed' ? (
                  <span className="text-[10px] text-green-500 flex items-center gap-0.5">
                    <CheckCircle size={10} /> 已完成
                  </span>
                ) : (
                  <span className="text-[10px] text-brand-amber flex items-center gap-0.5">
                    <Swords size={10} /> 进行中
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-gray-300 whitespace-nowrap">{timeAgo(c.completedAt ?? c.createdAt)}</span>
          </div>
        ),
      })
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [ratings, challenges, recipes])

  if (feed.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <Sparkles size={24} className="mx-auto text-gray-200 mb-2" />
        <p className="text-xs text-gray-300">还没有厨房动态</p>
        <p className="text-[10px] text-gray-200 mt-1">抽一道菜，做完后打卡吧！</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-medium text-brand-text mb-3 flex items-center gap-1.5">
        <Sparkles size={14} className="text-brand-amber" />
        厨房动态
      </h3>
      <div className="space-y-3">
        {feed.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            {item.content}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

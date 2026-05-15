'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Sparkles, Plus, BookOpen, ChefHat, Swords } from 'lucide-react'
import type { Recipe } from '@/types'

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

interface Props {
  recipes: Recipe[]
  onAddIngredient: (name: string) => void
  onRecordMemory: (recipe: Recipe) => void
  onCheckIn?: (recipe: Recipe) => void
  onChallenge?: (recipe: Recipe) => void
}

export default function BlindBox({ recipes, onAddIngredient, onRecordMemory, onCheckIn, onChallenge }: Props) {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleDraw = () => {
    if (isDrawing || recipes.length === 0) return
    setIsDrawing(true)
    setCurrentRecipe(null)
    setTimeout(() => {
      const picked = recipes[Math.floor(Math.random() * recipes.length)]
      setCurrentRecipe(picked)
      setIsDrawing(false)
    }, 800)
  }

  if (recipes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-brand-amber to-orange-200 rounded-3xl p-8 mb-5 text-center shadow-lg shadow-brand-amber/30">
        <Sparkles size={48} className="mx-auto text-white/40 mb-3" />
        <p className="text-white/70 text-sm">还没有菜谱哦，先去添加一道吧 →</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-brand-amber to-orange-200 rounded-3xl p-6 mb-5 text-center shadow-lg shadow-brand-amber/30">
      <p className="text-white/80 text-sm font-medium mb-3">今天吃什么</p>

      <AnimatePresence mode="wait">
        {isDrawing ? (
          <motion.div
            key="shuffle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="py-6"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            >
              <Shuffle size={64} className="mx-auto text-white/60" />
            </motion.div>
            <p className="text-white/60 text-sm mt-4">为你挑选中...</p>
          </motion.div>
        ) : currentRecipe ? (
          <motion.div
            key={currentRecipe.id}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="py-4"
          >
            <motion.span
              className="text-6xl block mb-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {recipeEmoji(currentRecipe)}
            </motion.span>
            <p className="text-white text-2xl font-bold mb-2">{currentRecipe.name}</p>
            {currentRecipe.category && (
              <p className="text-white/60 text-xs mb-3">{currentRecipe.category}</p>
            )}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {currentRecipe.ingredients.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => onAddIngredient(ing.name)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/25 rounded-full text-white text-xs active:scale-90 transition hover:bg-white/40"
                >
                  <span>{ing.name}{ing.amount ? ` ${ing.amount}` : ''}</span>
                  <Plus size={10} className="text-white/70" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => onRecordMemory(currentRecipe)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs active:scale-90 transition hover:bg-white/30"
              >
                <BookOpen size={12} />
                记录到记忆墙
              </button>
              {onCheckIn && (
                <button
                  onClick={() => onCheckIn(currentRecipe!)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/30 rounded-full text-white text-xs active:scale-90 transition hover:bg-white/40"
                >
                  <ChefHat size={12} />
                  做完啦，打卡！
                </button>
              )}
              {onChallenge && (
                <button
                  onClick={() => onChallenge(currentRecipe!)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs active:scale-90 transition hover:bg-white/30"
                >
                  <Swords size={12} />
                  挑战对方
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <Sparkles size={48} className="mx-auto text-white/40 mb-3" />
            <p className="text-white/60 text-sm">点击下方按钮抽一道菜</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleDraw}
        disabled={isDrawing}
        className="w-full mt-4 py-3 rounded-2xl font-semibold text-sm active:scale-95 transition bg-white text-brand-amber disabled:opacity-50"
      >
        {isDrawing ? '抽卡中...' : currentRecipe ? '换一道' : '抽一张！'}
      </motion.button>
    </div>
  )
}

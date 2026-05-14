'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shuffle,
  Sparkles,
  Plus,
  Check,
  Trash2,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import type { Recipe, ShoppingItem } from '@/types'

const mockRecipes: Recipe[] = [
  { id: '1', name: '番茄炒蛋', emoji: '🍅', ingredients: ['番茄', '鸡蛋', '葱花'] },
  { id: '2', name: '可乐鸡翅', emoji: '🍗', ingredients: ['鸡翅', '可乐', '姜片'] },
  { id: '3', name: '麻婆豆腐', emoji: '🫘', ingredients: ['豆腐', '肉末', '豆瓣酱'] },
  { id: '4', name: '蒜蓉西兰花', emoji: '🥦', ingredients: ['西兰花', '蒜末'] },
  { id: '5', name: '红烧排骨', emoji: '🍖', ingredients: ['排骨', '酱油', '冰糖'] },
  { id: '6', name: '奶油蘑菇汤', emoji: '🥣', ingredients: ['蘑菇', '奶油', '黄油'] },
  { id: '7', name: '日式咖喱饭', emoji: '🍛', ingredients: ['咖喱块', '土豆', '胡萝卜', '鸡肉'] },
  { id: '8', name: '葱油拌面', emoji: '🍜', ingredients: ['面条', '小葱', '酱油'] },
]

const mockShoppingList: ShoppingItem[] = [
  { id: 's1', name: '鸡蛋', completed: false },
  { id: 's2', name: '牛奶', completed: false, note: '要全脂的' },
  { id: 's3', name: '番茄', completed: false },
  { id: 's4', name: '面包', completed: true },
  { id: 's5', name: '鸡翅', completed: false },
]

export default function RecipesPage() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [shoppingItems, setShoppingItems] = useState(mockShoppingList)
  const [newItemName, setNewItemName] = useState('')

  const handleDraw = () => {
    if (isDrawing) return
    setIsDrawing(true)
    setCurrentRecipe(null)
    setTimeout(() => {
      const picked = mockRecipes[Math.floor(Math.random() * mockRecipes.length)]
      setCurrentRecipe(picked)
      setIsDrawing(false)
    }, 800)
  }

  const toggleItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const addItem = () => {
    if (!newItemName.trim()) return
    setShoppingItems((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        name: newItemName.trim(),
        completed: false,
      },
    ])
    setNewItemName('')
  }

  const removeItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-xl font-bold text-brand-text">🍳 厨房</h1>
          <p className="text-xs text-gray-400 mt-0.5">今天一起吃什么</p>
        </motion.div>

        {/* Blindbox Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-amber to-orange-200 rounded-3xl p-6 mb-5 text-center shadow-lg shadow-brand-amber/30"
        >
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
                  {currentRecipe.emoji}
                </motion.span>
                <p className="text-white text-2xl font-bold mb-2">
                  {currentRecipe.name}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {currentRecipe.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2.5 py-1 bg-white/25 rounded-full text-white text-xs"
                    >
                      {ing}
                    </span>
                  ))}
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
            className="w-full py-3 rounded-2xl font-semibold text-sm active:scale-95 transition bg-white text-brand-amber disabled:opacity-50 disabled:active:scale-100"
          >
            {isDrawing ? '抽卡中...' : currentRecipe ? '换一道' : '抽一张！'}
          </motion.button>
        </motion.div>

        {/* Shopping List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-brand-text">
              🛒 买菜清单
            </h2>
            <span className="text-xs text-gray-400">
              {shoppingItems.filter((i) => i.completed).length}/{shoppingItems.length}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {/* Add Item */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <Plus size={18} className="text-gray-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="添加新食材..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300"
              />
              <button
                onClick={addItem}
                disabled={!newItemName.trim()}
                className="text-xs text-brand-sage font-medium disabled:text-gray-300 active:scale-95 transition"
              >
                添加
              </button>
            </div>

            {/* Item List */}
            <AnimatePresence>
              {shoppingItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 active:scale-90 transition ${
                      item.completed
                        ? 'bg-brand-sage border-brand-sage'
                        : 'border-gray-300'
                    }`}
                  >
                    {item.completed && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm transition-all duration-300 ${
                        item.completed
                          ? 'line-through text-gray-300'
                          : 'text-brand-text'
                      }`}
                    >
                      {item.name}
                    </p>
                    {item.note && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 active:scale-90 transition"
                  >
                    <Trash2 size={14} className="text-gray-300" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

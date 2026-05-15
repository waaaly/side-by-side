'use client'

import { useState, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ArrowLeft, Swords } from 'lucide-react'
import BlindBox from '@/components/BlindBox'
import ShoppingList from '@/components/ShoppingList'
import FoodMemoryWall from '@/components/FoodMemoryWall'
import RatingSheet from '@/components/RatingSheet'
import KitchenFeed from '@/components/KitchenFeed'
import { useRecipes } from '@/hooks/useRecipes'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useFoodMemories } from '@/hooks/useFoodMemories'
import { useAllRatings } from '@/hooks/useRecipeRatings'
import { useCookingChallenges } from '@/hooks/useCookingChallenges'
import { getStoredPairId } from '@/lib/pairing'
import type { Recipe, RecipeIngredient } from '@/types'

const CATEGORY_EMOJI: Record<string, string> = {
  '家常菜': '🍳', '川菜': '🌶️', '湘菜': '🌶️', '粤菜': '🥟',
  '西餐': '🍝', '日料': '🍣', '韩餐': '🥘', '东南亚': '🍜',
  '甜品': '🍰', '烘焙': '🥐', '汤羹': '🥣', '沙拉': '🥗',
  '烧烤': '🥩', '早餐': '🥞', '面食': '🍜', '饮品': '🧋',
}

const DIFFICULTIES = ['简单', '中等', '困难']
const CATEGORIES = Object.keys(CATEGORY_EMOJI)

function recipeEmoji(recipe: { category?: string; name: string }): string {
  if (recipe.category && CATEGORY_EMOJI[recipe.category]) return CATEGORY_EMOJI[recipe.category]
  const match = recipe.name.match(/^(\p{Extended_Pictographic})/u)
  return match?.[1] ?? '🍳'
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function KitchenPage() {
  const pairId = getStoredPairId()
  const { recipes, addRecipe } = useRecipes()
  const { items: shoppingItems, addItem, toggleItem, deleteItem, batchAddItems } = useShoppingList(pairId)
  const { memories, addMemory, deleteMemory } = useFoodMemories(pairId)
  const { ratings: allRatings, addRating } = useAllRatings()
  const { challenges, addChallenge, updateChallengeStatus } = useCookingChallenges()

  const [viewMode, setViewMode] = useState<'home' | 'memories'>('home')

  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDifficulty, setFormDifficulty] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formIngredients, setFormIngredients] = useState<RecipeIngredient[]>([{ name: '', amount: '' }])
  const [formSteps, setFormSteps] = useState<string[]>([''])
  const [formTags, setFormTags] = useState('')

  const [ratingRecipe, setRatingRecipe] = useState<Recipe | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challengeRecipe, setChallengeRecipe] = useState<Recipe | null>(null)

  const handleAddIngredient = (name: string) => {
    if (shoppingItems.some((i) => i.name === name)) return
    addItem(name)
  }

  const handleAddAllIngredients = (names: string[]) => {
    batchAddItems(names)
  }

  const handleRecordMemory = (recipe: Recipe) => {
    if (memories.some((m) => m.recipeId === recipe.id && m.date === todayString())) return
    addMemory({ recipeName: recipe.name, emoji: recipeEmoji(recipe), date: todayString() })
  }

  const handleCheckIn = (recipe: Recipe) => {
    setRatingRecipe(recipe)
  }

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!ratingRecipe) return
    await addRating({ recipeId: ratingRecipe.id, createdBy: 'me', rating, comment: comment || undefined })
  }

  const handleChallenge = (recipe: Recipe) => {
    setChallengeRecipe(recipe)
    setShowChallengeForm(true)
  }

  const handleSendChallenge = async () => {
    if (!challengeRecipe) return
    await addChallenge({ recipeId: challengeRecipe.id, fromUser: 'me', toUser: 'partner' })
    setShowChallengeForm(false)
    setChallengeRecipe(null)
  }

  const handleToggleShopping = (id: string) => {
    const item = shoppingItems.find((i) => i.id === id)
    if (item) toggleItem(id, !item.completed)
  }

  const handleAddShopping = (name: string) => {
    addItem(name)
  }

  const handleDeleteShopping = (id: string) => {
    deleteItem(id)
  }

  const openAddForm = () => {
    setFormName('')
    setFormDifficulty('')
    setFormCategory('')
    setFormIngredients([{ name: '', amount: '' }])
    setFormSteps([''])
    setFormTags('')
    setShowRecipeForm(true)
  }

  const handleSaveRecipe = () => {
    if (!formName.trim()) return
    const ingredients = formIngredients.filter((i) => i.name.trim())
    const steps = formSteps.filter((s) => s.trim())
    const tags = formTags.split(/[、,，\s]+/).filter(Boolean)
    addRecipe({
      name: formName.trim(),
      difficulty: formDifficulty || undefined,
      category: formCategory || undefined,
      ingredients,
      steps,
      tags,
    })
    setShowRecipeForm(false)
  }

  const updateIngredient = (idx: number, field: 'name' | 'amount', val: string) => {
    setFormIngredients((prev) => prev.map((i, n) => n === idx ? { ...i, [field]: val } : i))
  }

  const addIngredientField = () => setFormIngredients((prev) => [...prev, { name: '', amount: '' }])
  const removeIngredientField = (idx: number) => {
    if (formIngredients.length <= 1) return
    setFormIngredients((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateStep = (idx: number, val: string) => {
    setFormSteps((prev) => prev.map((s, i) => i === idx ? val : s))
  }

  const addStepField = () => setFormSteps((prev) => [...prev, ''])
  const removeStepField = (idx: number) => {
    setFormSteps((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <Fragment>
      <div className="px-5 pt-3 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          {viewMode === 'memories' ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setViewMode('home')} className="active:scale-95 transition">
                <ArrowLeft size={20} className="text-gray-400" />
              </button>
              <h1 className="text-xl font-bold text-brand-text">🖼️ 美食记忆墙</h1>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-brand-text">🍳 厨房</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm active:scale-95 transition"
                >
                  <Plus size={14} className="text-brand-pink" />
                  <span className="text-xs text-brand-pink font-medium">菜谱</span>
                </button>
                <button
                  onClick={() => setViewMode('memories')}
                  className="bg-white rounded-full px-3 py-1.5 shadow-sm active:scale-95 transition"
                >
                  <span className="text-xs text-gray-500 font-medium">🖼️ 记忆墙</span>
                </button>
              </div>
            </>
          )}
        </motion.div>

        {viewMode === 'memories' ? (
          <FoodMemoryWall memories={memories} />
        ) : (
          <>
            <BlindBox
              recipes={recipes}
              onAddIngredient={handleAddIngredient}
              onAddAllIngredients={handleAddAllIngredients}
              onRecordMemory={handleRecordMemory}
              onCheckIn={handleCheckIn}
              onChallenge={handleChallenge}
            />

            <ShoppingList
              items={shoppingItems}
              onToggle={handleToggleShopping}
              onAdd={handleAddShopping}
              onDelete={handleDeleteShopping}
            />

            <div className="mb-5">
              <KitchenFeed
                recipes={recipes}
                ratings={allRatings}
                challenges={challenges}
                onChallenge={handleChallenge}
              />
            </div>

            <div className="mb-20" />
          </>
        )}
      </div>

      <AnimatePresence>
        {showRecipeForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowRecipeForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col max-h-[80vh]"
              style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50 flex-shrink-0">
                <div />
                <h2 className="text-base font-semibold text-brand-text">
                  添加菜谱
                </h2>
                <button onClick={() => setShowRecipeForm(false)} className="active:scale-95 transition">
                  <X size={22} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-1.5 block">菜名</label>
                  <input
                    type="text"
                    placeholder="如：番茄炒蛋"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 placeholder:text-gray-300"
                  />
                </div>

                <div className="mb-4 flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">分类</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 appearance-none"
                    >
                      <option value="">选择分类</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">难度</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 appearance-none"
                    >
                      <option value="">选择难度</option>
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-400">食材</label>
                    <button
                      onClick={addIngredientField}
                      className="text-xs text-brand-pink font-medium active:scale-95 transition"
                    >
                      + 添加
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="食材名"
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                          className="flex-1 text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2 placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          placeholder="用量"
                          value={ing.amount}
                          onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                          className="w-20 text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-3 py-2 placeholder:text-gray-300 text-center"
                        />
                        {formIngredients.length > 1 && (
                          <button
                            onClick={() => removeIngredientField(idx)}
                            className="p-1 active:scale-90 transition"
                          >
                            <X size={14} className="text-gray-300" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-400">步骤</label>
                    <button
                      onClick={addStepField}
                      className="text-xs text-brand-pink font-medium active:scale-95 transition"
                    >
                      + 添加步骤
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-xs text-gray-400 mt-3 min-w-[1.2rem] text-right">
                          {idx + 1}
                        </span>
                        <textarea
                          placeholder={`步骤 ${idx + 1}`}
                          value={step}
                          onChange={(e) => updateStep(idx, e.target.value)}
                          rows={2}
                          className="flex-1 text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2 placeholder:text-gray-300 resize-none"
                        />
                        <button
                          onClick={() => removeStepField(idx)}
                          className="p-1 mt-2 active:scale-90 transition"
                        >
                          <X size={14} className="text-gray-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    标签（用空格或逗号分隔）
                  </label>
                  <input
                    type="text"
                    placeholder="如：快手菜 家常 辣"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 placeholder:text-gray-300"
                  />
                </div>

                <button
                  onClick={handleSaveRecipe}
                  disabled={!formName.trim()}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40 mb-4"
                >
                  添加菜谱
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <RatingSheet
        recipe={ratingRecipe ?? { id: '', name: '', category: '', ingredients: [], steps: [], createdAt: '' }}
        open={!!ratingRecipe}
        onClose={() => setRatingRecipe(null)}
        onSubmit={handleRatingSubmit}
      />

      <AnimatePresence>
        {showChallengeForm && challengeRecipe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => { setShowChallengeForm(false); setChallengeRecipe(null) }}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl"
              style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            >
              <div className="px-6 pt-5 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div />
                  <h2 className="text-base font-semibold text-brand-text">挑战对方</h2>
                  <button
                    onClick={() => { setShowChallengeForm(false); setChallengeRecipe(null) }}
                    className="active:scale-95 transition"
                  >
                    <X size={22} className="text-gray-400" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <span className="text-4xl block mb-2">{recipeEmoji(challengeRecipe)}</span>
                  <p className="text-lg font-medium text-brand-text">{challengeRecipe.name}</p>
                  <p className="text-xs text-gray-400 mt-2">让对方也来做这道菜吧！</p>
                </div>
                <button
                  onClick={handleSendChallenge}
                  className="w-full py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition bg-gradient-to-r from-brand-amber to-orange-400"
                >
                  发起挑战
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Fragment>
  )
}

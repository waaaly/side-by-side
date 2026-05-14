'use client'

import { useState, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search, Edit3, Trash2, ChevronDown, ArrowLeft } from 'lucide-react'
import BlindBox from '@/components/BlindBox'
import ShoppingList from '@/components/ShoppingList'
import FoodMemoryWall from '@/components/FoodMemoryWall'
import { useRecipes } from '@/hooks/useRecipes'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useFoodMemories } from '@/hooks/useFoodMemories'
import { getStoredPairId } from '@/lib/pairing'
import type { Recipe } from '@/types'

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function KitchenPage() {
  const pairId = getStoredPairId()
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes(pairId)
  const { items: shoppingItems, addItem, toggleItem, deleteItem } = useShoppingList(pairId)
  const { memories, addMemory, deleteMemory } = useFoodMemories(pairId)

  const [viewMode, setViewMode] = useState<'home' | 'memories'>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmoji, setFormEmoji] = useState('')
  const [formIngredients, setFormIngredients] = useState<string[]>([''])
  const [formTags, setFormTags] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const r of recipes) r.tags?.forEach((t) => set.add(t))
    return Array.from(set).sort()
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    let result = recipes
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (selectedTag) {
      result = result.filter((r) => r.tags?.includes(selectedTag))
    }
    return result
  }, [recipes, searchQuery, selectedTag])

  const handleAddIngredient = (name: string) => {
    if (shoppingItems.some((i) => i.name === name)) return
    addItem(name)
  }

  const handleRecordMemory = (recipe: Recipe) => {
    if (memories.some((m) => m.recipeId === recipe.id && m.date === todayString())) return
    addMemory({ recipeName: recipe.name, emoji: recipe.emoji, date: todayString() })
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
    setEditingRecipe(null)
    setFormName('')
    setFormEmoji('🍳')
    setFormIngredients([''])
    setFormTags('')
    setShowRecipeForm(true)
  }

  const openEditForm = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormName(recipe.name)
    setFormEmoji(recipe.emoji)
    setFormIngredients(recipe.ingredients.length > 0 ? [...recipe.ingredients] : [''])
    setFormTags((recipe.tags || []).join('、'))
    setShowRecipeForm(true)
  }

  const handleSaveRecipe = () => {
    if (!formName.trim() || !formEmoji.trim()) return
    const ingredients = formIngredients.filter((i) => i.trim())
    const tags = formTags.split(/[、,，\s]+/).filter(Boolean)
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, { name: formName.trim(), emoji: formEmoji.trim(), ingredients, tags })
    } else {
      addRecipe({ name: formName.trim(), emoji: formEmoji.trim(), ingredients, tags })
    }
    setShowRecipeForm(false)
  }

  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id)
  }

  const updateIngredient = (idx: number, val: string) => {
    const next = [...formIngredients]
    next[idx] = val
    setFormIngredients(next)
  }

  const addIngredientField = () => setFormIngredients((prev) => [...prev, ''])
  const removeIngredientField = (idx: number) => {
    if (formIngredients.length <= 1) return
    setFormIngredients((prev) => prev.filter((_, i) => i !== idx))
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
              onRecordMemory={handleRecordMemory}
            />

            <ShoppingList
              items={shoppingItems}
              onToggle={handleToggleShopping}
              onAdd={handleAddShopping}
              onDelete={handleDeleteShopping}
            />

            <div className="mb-20">
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm active:scale-[0.98] transition"
              >
                <span className="text-sm font-medium text-brand-text">
                  📚 食谱库 ({recipes.length}道)
                </span>
                <motion.div
                  animate={{ rotate: showLibrary ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-gray-300" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showLibrary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        placeholder="搜索菜谱..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm outline-none placeholder:text-gray-300 shadow-sm"
                      />
                    </div>

                    {allTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button
                          onClick={() => setSelectedTag(null)}
                          className={`px-2.5 py-1 rounded-full text-[10px] active:scale-90 transition ${
                            !selectedTag
                              ? 'bg-brand-amber text-white font-medium'
                              : 'bg-white text-gray-400 shadow-sm'
                          }`}
                        >
                          全部
                        </button>
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`px-2.5 py-1 rounded-full text-[10px] active:scale-90 transition ${
                              selectedTag === tag
                                ? 'bg-brand-amber text-white font-medium'
                                : 'bg-white text-gray-400 shadow-sm'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {filteredRecipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm"
                        >
                          <span className="text-xl">{recipe.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-brand-text truncate">
                              {recipe.name}
                            </p>
                            {recipe.tags && recipe.tags.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {recipe.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openEditForm(recipe)}
                            className="p-1.5 active:scale-90 transition"
                          >
                            <Edit3 size={14} className="text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="p-1.5 active:scale-90 transition"
                          >
                            <Trash2 size={14} className="text-gray-300" />
                          </button>
                        </div>
                      ))}
                      {filteredRecipes.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">没有匹配的菜谱</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                  {editingRecipe ? '编辑菜谱' : '添加菜谱'}
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

                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-1.5 block">Emoji</label>
                  <input
                    type="text"
                    placeholder="如：🍅"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-20 text-center text-lg text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 placeholder:text-gray-300"
                    maxLength={4}
                  />
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
                          placeholder={`食材 ${idx + 1}`}
                          value={ing}
                          onChange={(e) => updateIngredient(idx, e.target.value)}
                          className="flex-1 text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2 placeholder:text-gray-300"
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
                  disabled={!formName.trim() || !formEmoji.trim()}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40 mb-4"
                >
                  {editingRecipe ? '保存修改' : '添加菜谱'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Fragment>
  )
}

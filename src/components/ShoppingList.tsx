'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2 } from 'lucide-react'
import type { ShoppingItem } from '@/types'

interface Props {
  items: ShoppingItem[]
  onToggle: (id: string) => void
  onAdd: (name: string, note?: string) => void
  onDelete: (id: string) => void
}

export default function ShoppingList({ items, onToggle, onAdd, onDelete }: Props) {
  const [newName, setNewName] = useState('')
  const completedCount = items.filter((i) => i.completed).length

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName.trim())
    setNewName('')
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-brand-text">🛒 买菜清单</h2>
        <span className="text-xs text-gray-400 tabular">
          {completedCount}/{items.length} ✓
        </span>
      </div>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
          <Plus size={18} className="text-gray-300 flex-shrink-0" />
          <input
            type="text"
            placeholder="添加新食材..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="text-xs text-brand-sage font-medium disabled:text-gray-300 active:scale-95 transition"
          >
            添加
          </button>
        </div>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
            >
              <button
                onClick={() => onToggle(item.id)}
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
                    item.completed ? 'line-through text-gray-300' : 'text-brand-text'
                  }`}
                >
                  {item.name}
                </p>
                {item.note && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.note}</p>
                )}
              </div>
              <button onClick={() => onDelete(item.id)} className="p-1 active:scale-90 transition">
                <Trash2 size={14} className="text-gray-300" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

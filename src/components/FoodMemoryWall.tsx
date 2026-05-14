'use client'

import { motion } from 'framer-motion'
import type { FoodMemory } from '@/types'

interface Props {
  memories: FoodMemory[]
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default function FoodMemoryWall({ memories }: Props) {
  const sorted = [...memories].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">📸</span>
        <p className="text-sm text-gray-400">还没有美食记录</p>
        <p className="text-xs text-gray-300 mt-1">做完一道菜后记得记录到记忆墙哦</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-amber-100 rounded-full" />
      <div className="space-y-4">
        {sorted.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4"
          >
            <div className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-lg">
              {memory.emoji}
            </div>
            <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{fmtDate(memory.date)}</p>
              <p className="text-sm font-medium text-brand-text">
                我们吃了 <span className="text-brand-amber">{memory.recipeName}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

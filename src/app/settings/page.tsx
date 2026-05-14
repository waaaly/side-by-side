'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const settingsItems = [
  { icon: '📂', label: '分类管理', desc: '管理消费分类的图标、名称和排序', href: '/settings/categories' },
  { icon: '🍳', label: '食谱管理', desc: '管理食谱库中的全部菜谱', href: '/settings/recipes' },
  { icon: '💰', label: '预算设置', desc: '设定月度预算和各分类上限', href: '/settings/budget' },
  { icon: '📅', label: '日历事件', desc: '查看和管理所有日历事件', href: '/settings/calendar' },
]

export default function SettingsPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-xl font-bold text-brand-text">⚙️ 设置</h1>
          <p className="text-xs text-gray-400 mt-0.5">管理我们的应用</p>
        </motion.div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {settingsItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0 active:scale-[0.98] transition hover:bg-gray-50/50"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 w-full"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-brand-text">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const dayNames = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-xl font-bold text-brand-text">📅 日历</h1>
          <p className="text-xs text-gray-400 mt-0.5">我们的重要日子</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-1 active:scale-95 transition">
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h2 className="text-base font-semibold text-brand-text">
              {year}年 {monthNames[month]}
            </h2>
            <button onClick={nextMonth} className="p-1 active:scale-95 transition">
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayNames.map((d) => (
              <span key={d} className="text-xs text-gray-400 font-medium py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
              return (
                <div key={i} className="aspect-square flex items-center justify-center">
                  {day && (
                    <span
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                        isToday
                          ? 'bg-brand-pink text-white font-semibold'
                          : 'text-brand-text hover:bg-brand-pink/10'
                      }`}
                    >
                      {day}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  )
}

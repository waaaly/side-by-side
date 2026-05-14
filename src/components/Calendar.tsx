'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '@/types'

interface Props {
  currentMonth: Date
  events: CalendarEvent[]
  onDateClick: (dateStr: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const MONTH = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const DAYS = ['日', '一', '二', '三', '四', '五', '六']

function pad(n: number) { return String(n).padStart(2, '0') }

function getPeriodRanges(events: CalendarEvent[]): [string, string][] {
  const starts = events.filter((e) => e.type === 'period_start').sort((a, b) => a.date.localeCompare(b.date))
  const ends = events.filter((e) => e.type === 'period_end').sort((a, b) => a.date.localeCompare(b.date))
  const ranges: [string, string][] = []
  for (const s of starts) {
    const end = ends.find((e) => e.date >= s.date)
    if (end) ranges.push([s.date, end.date])
  }
  return ranges
}

function getEventDotTypes(events: CalendarEvent[], ds: string): string[] {
  const set = new Set<string>()
  for (const e of events) {
    if (e.date === ds) {
      if (e.type === 'period_start' || e.type === 'period_end') set.add('period')
      else set.add(e.type)
    }
    if (e.repeat) {
      const [, em, ed] = e.date.split('-')
      const [, cm, cd] = ds.split('-')
      if (`${em}-${ed}` === `${cm}-${cd}` && e.date !== ds) set.add(e.type)
    }
  }
  return Array.from(set)
}

const DOT_ICON: Record<string, string> = {
  period: '🩸',
  anniversary: '❤️',
  birthday: '🎂',
  schedule: '📅',
}

export default function Calendar({ currentMonth, events, onDateClick, onPrevMonth, onNextMonth }: Props) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`

  const periodRanges = useMemo(() => getPeriodRanges(events), [events])
  const isPeriod = (ds: string) => periodRanges.some(([s, e]) => ds >= s && ds <= e)

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <button onClick={onPrevMonth} className="p-1 active:scale-95 transition">
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <h2 className="text-base font-semibold text-brand-text">{year}年 {MONTH[month]}</h2>
        <button onClick={onNextMonth} className="p-1 active:scale-95 transition">
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS.map((d) => (
          <span key={d} className="text-xs text-gray-400 font-medium py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const ds = `${year}-${pad(month + 1)}-${pad(day)}`
          const isToday = ds === todayStr
          const inPeriod = isPeriod(ds)
          const dots = getEventDotTypes(events, ds)

          return (
            <button
              key={i}
              onClick={() => onDateClick(ds)}
              className="relative flex flex-col items-center py-1 active:scale-90 transition min-h-[52px]"
            >
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm relative ${
                  isToday
                    ? 'bg-brand-pink text-white font-semibold'
                    : inPeriod
                      ? 'text-brand-pink font-medium'
                      : 'text-brand-text hover:bg-brand-pink/10'
                }`}
              >
                {inPeriod && !isToday && (
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-pink/15 to-brand-rose/15 rounded-full" />
                )}
                <span className="relative z-10">{day}</span>
              </div>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 h-3">
                  {dots.map((t) => (
                    <span key={t} className="text-[7px] leading-none">{DOT_ICON[t] || '•'}</span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

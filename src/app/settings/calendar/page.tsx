'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { CalendarEvent } from '@/types'

const mockEvents: CalendarEvent[] = [
  { id: 'e1', type: 'period_start', title: '姨妈来了', date: '2026-05-10' },
  { id: 'e2', type: 'period_end', title: '姨妈结束', date: '2026-05-14' },
  { id: 'e3', type: 'anniversary', title: '在一起 1000 天', date: '2026-05-20', repeat: true },
  { id: 'e4', type: 'birthday', title: '妈妈生日', date: '2026-05-18', repeat: true },
  { id: 'e5', type: 'schedule', title: '周五约会电影', date: '2026-05-16', note: '晚7点 IMAX' },
]

const TYPE_META: Record<string, { icon: string; label: string }> = {
  period_start: { icon: '🩸', label: '生理期开始' },
  period_end: { icon: '🩸', label: '生理期结束' },
  anniversary: { icon: '❤️', label: '纪念日' },
  birthday: { icon: '🎂', label: '生日' },
  schedule: { icon: '📅', label: '日程' },
}

function fmtDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarEventsSettingsPage() {
  const [events, setEvents] = useState(mockEvents)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date))

  const handleDelete = (id: string, repeat: boolean) => {
    if (repeat) {
      setShowConfirm(id)
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const confirmDeleteAll = () => {
    if (!showConfirm) return
    const target = events.find((e) => e.id === showConfirm)
    if (!target) return setShowConfirm(null)
    if (target.repeat) {
      const [, em, ed] = target.date.split('-')
      setEvents((prev) =>
        prev.filter((e) => {
          if (e.id === target.id) return false
          if (e.repeat && e.type === target.type) {
            const [, em2, ed2] = e.date.split('-')
            if (`${em2}-${ed2}` === `${em}-${ed}`) return false
          }
          return true
        }),
      )
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== showConfirm))
    }
    setShowConfirm(null)
  }

  const confirmDeleteOnce = () => {
    if (!showConfirm) return
    setEvents((prev) => prev.filter((e) => e.id !== showConfirm))
    setShowConfirm(null)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings" className="active:scale-95 transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-brand-text">📅 日历事件管理</h1>
        </div>

        <div className="space-y-1.5 mb-20">
          {sorted.map((ev, i) => {
            const meta = TYPE_META[ev.type]
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm"
              >
                <span>{meta?.icon || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-text">{ev.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{meta?.label || ev.type}</span>
                    <span>·</span>
                    <span>{fmtDate(ev.date)}</span>
                    {ev.repeat && <span>· 每年重复</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(ev.id, !!ev.repeat)}
                  className="p-1.5 active:scale-90 transition"
                >
                  <Trash2 size={14} className="text-gray-300" />
                </button>
              </motion.div>
            )
          })}
          {sorted.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">暂无日历事件</p>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-8"
            >
              <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-xl">
                <p className="text-sm font-semibold text-brand-text text-center mb-2">删除重复事件</p>
                <p className="text-xs text-gray-400 text-center mb-5">该事件每年重复，要如何删除？</p>
                <div className="space-y-2">
                  <button
                    onClick={confirmDeleteOnce}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-brand-text bg-gray-100 active:scale-95 transition"
                  >
                    仅删除今年
                  </button>
                  <button
                    onClick={confirmDeleteAll}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-brand-coral active:scale-95 transition"
                  >
                    删除所有年份
                  </button>
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="w-full py-2.5 rounded-xl text-sm text-gray-400 active:scale-95 transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

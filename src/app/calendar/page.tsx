'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import Calendar from '@/components/Calendar'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { getStoredPairId } from '@/lib/pairing'

const EVENT_LABEL: Record<string, { icon: string; label: string }> = {
  period_start: { icon: '🩸', label: '生理期开始' },
  period_end: { icon: '🩸', label: '生理期结束' },
  anniversary: { icon: '❤️', label: '纪念日' },
  birthday: { icon: '🎂', label: '生日' },
  schedule: { icon: '📅', label: '日程' },
}

function fmtDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function getActivePeriod(events: { type: string; date: string }[]): string | null {
  const starts = events
    .filter((e) => e.type === 'period_start')
    .sort((a, b) => b.date.localeCompare(a.date))
  for (const s of starts) {
    const hasEnd = events.some((e) => e.type === 'period_end' && e.date >= s.date)
    if (!hasEnd) return s.date
  }
  return null
}

export default function CalendarPage() {
  const pairId = getStoredPairId()
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarEvents(pairId)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'anniversary' | 'birthday' | 'schedule'>('anniversary')
  const [formTitle, setFormTitle] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formRepeat, setFormRepeat] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const activePeriodStart = useMemo(() => getActivePeriod(events), [events])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    return events.filter((e) => {
      if (e.date === selectedDate) return true
      if (e.repeat) {
        const [, em, ed] = e.date.split('-')
        const [, sm, sd] = selectedDate.split('-')
        if (`${em}-${ed}` === `${sm}-${sd}`) return true
      }
      return false
    })
  }, [selectedDate, events])

  const handlePrevMonth = () => {
    const m = currentMonth.getMonth()
    setCurrentMonth(new Date(currentMonth.getFullYear(), m - 1, 1))
  }
  const handleNextMonth = () => {
    const m = currentMonth.getMonth()
    setCurrentMonth(new Date(currentMonth.getFullYear(), m + 1, 1))
  }

  const handleDateClick = (ds: string) => {
    setSelectedDate(ds)
    setShowDeleteConfirm(null)
  }

  const handlePeriodStart = () => {
    if (!selectedDate) return
    if (events.some((e) => e.type === 'period_start' && e.date === selectedDate)) return
    addEvent({ type: 'period_start', title: '姨妈来了', date: selectedDate })
    setSelectedDate(null)
  }

  const handlePeriodEnd = () => {
    if (!selectedDate || !activePeriodStart) return
    if (events.some((e) => e.type === 'period_end' && e.date === selectedDate)) return
    if (selectedDate < activePeriodStart) return
    addEvent({ type: 'period_end', title: '姨妈结束', date: selectedDate })
    setSelectedDate(null)
  }

  const openForm = (type: 'anniversary' | 'birthday' | 'schedule') => {
    setFormType(type)
    setFormTitle('')
    setFormNote('')
    setFormRepeat(type !== 'schedule')
    setShowForm(true)
  }

  const handleSaveEvent = () => {
    if (!formTitle.trim() || !selectedDate) return
    addEvent({
      type: formType,
      title: formTitle.trim(),
      date: selectedDate,
      repeat: formRepeat,
      note: formNote.trim() || undefined,
    })
    setShowForm(false)
    setSelectedDate(null)
  }

  const handleDeleteEvent = (id: string, repeat: boolean) => {
    if (repeat) {
      setShowDeleteConfirm(id)
      return
    }
    deleteEvent(id)
    setSelectedDate(null)
  }

  const confirmDeleteAll = () => {
    if (!showDeleteConfirm) return
    const target = events.find((e) => e.id === showDeleteConfirm)
    if (!target) return setShowDeleteConfirm(null)
    const [, em, ed] = target.date.split('-')
    events
      .filter((e) => {
        if (e.id === target.id) return true
        if (e.repeat && e.type === target.type) {
          const [, em2, ed2] = e.date.split('-')
          return `${em2}-${ed2}` === `${em}-${ed}`
        }
        return false
      })
      .forEach((e) => deleteEvent(e.id))
    setShowDeleteConfirm(null)
    setSelectedDate(null)
  }

  const confirmDeleteOnce = () => {
    if (!showDeleteConfirm) return
    deleteEvent(showDeleteConfirm)
    setShowDeleteConfirm(null)
    setSelectedDate(null)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <h1 className="text-xl font-bold text-brand-text">📅 日历</h1>
          <p className="text-xs text-gray-400 mt-0.5">我们的重要日子</p>
        </motion.div>

        <Calendar
          currentMonth={currentMonth}
          events={events}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      </div>

      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedDate(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col max-h-[70vh]"
              style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50 flex-shrink-0">
                <div />
                <h2 className="text-base font-semibold text-brand-text">{fmtDate(selectedDate)}</h2>
                <button onClick={() => setSelectedDate(null)} className="active:scale-95 transition">
                  <X size={22} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {selectedEvents.length > 0 && (
                  <div className="mb-5 space-y-2">
                    <p className="text-xs text-gray-400 mb-2">🗓️ 当天事件</p>
                    {selectedEvents.map((ev) => {
                      const meta = EVENT_LABEL[ev.type]
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
                        >
                          <span>{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-brand-text">{ev.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>{meta.label}</span>
                              {ev.repeat && <span>· 每年重复</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(ev.id, !!ev.repeat)}
                            className="p-1.5 active:scale-90 transition"
                          >
                            <Trash2 size={14} className="text-gray-300" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-3">📌 添加事件</p>
                <div className="flex flex-wrap gap-2">
                  {!events.some((e) => e.type === 'period_start' && e.date === selectedDate) &&
                    selectedDate !== activePeriodStart && (
                    <button
                      onClick={handlePeriodStart}
                      className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 rounded-xl text-xs text-pink-500 font-medium active:scale-90 transition"
                    >
                      <span>🩸</span> 姨妈来了
                    </button>
                  )}
                  {activePeriodStart && selectedDate >= activePeriodStart &&
                    !events.some((e) => e.type === 'period_end' && e.date === selectedDate) && (
                    <button
                      onClick={handlePeriodEnd}
                      className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 rounded-xl text-xs text-pink-500 font-medium active:scale-90 transition"
                    >
                      <span>🩸</span> 姨妈结束
                    </button>
                  )}
                  <button
                    onClick={() => openForm('anniversary')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 rounded-xl text-xs text-red-400 font-medium active:scale-90 transition"
                  >
                    <span>❤️</span> 纪念日
                  </button>
                  <button
                    onClick={() => openForm('birthday')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 rounded-xl text-xs text-amber-500 font-medium active:scale-90 transition"
                  >
                    <span>🎂</span> 生日
                  </button>
                  <button
                    onClick={() => openForm('schedule')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-xl text-xs text-blue-500 font-medium active:scale-90 transition"
                  >
                    <span>📅</span> 日程
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col"
              style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-50 flex-shrink-0">
                <div />
                <h2 className="text-base font-semibold text-brand-text">
                  {formType === 'anniversary' ? '添加纪念日' : formType === 'birthday' ? '添加生日' : '添加日程'}
                </h2>
                <button onClick={() => setShowForm(false)} className="active:scale-95 transition">
                  <X size={22} className="text-gray-400" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    {formType === 'anniversary' ? '纪念日名称' : formType === 'birthday' ? '称呼' : '日程标题'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formType === 'anniversary'
                        ? '如：在一起 1000 天'
                        : formType === 'birthday'
                          ? '如：妈妈'
                          : '如：周五约会电影'
                    }
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 placeholder:text-gray-300"
                  />
                </div>

                {formType === 'schedule' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">备注（可选）</label>
                    <input
                      type="text"
                      placeholder="如：晚7点 IMAX"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-2.5 placeholder:text-gray-300"
                    />
                  </div>
                )}

                {(formType === 'anniversary' || formType === 'birthday') && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">每年重复</span>
                    <button
                      onClick={() => setFormRepeat(!formRepeat)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        formRepeat ? 'bg-brand-pink' : 'bg-gray-200'
                      }`}
                    >
                      <motion.div
                        animate={{ x: formRepeat ? 20 : 2 }}
                        className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                      />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSaveEvent}
                  disabled={!formTitle.trim()}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40"
                >
                  添加
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowDeleteConfirm(null)}
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
                    onClick={() => setShowDeleteConfirm(null)}
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

      <BottomNav />
    </div>
  )
}

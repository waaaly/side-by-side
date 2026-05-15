'use client'

import { useState, useMemo, Fragment, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ChevronRight } from 'lucide-react'
import Calendar from '@/components/Calendar'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import { getStoredPairId } from '@/lib/pairing'
import { useNav } from '@/contexts/NavContext'

const EVENT_LABEL: Record<string, { icon: string; label: string; color: string }> = {
  period_start: { icon: '🩸', label: '生理期开始', color: 'bg-pink-50 text-pink-500' },
  period_end: { icon: '🩸', label: '生理期结束', color: 'bg-pink-50 text-pink-500' },
  anniversary: { icon: '❤️', label: '纪念日', color: 'bg-red-50 text-red-400' },
  birthday: { icon: '🎂', label: '生日', color: 'bg-amber-50 text-amber-500' },
  schedule: { icon: '📅', label: '日程', color: 'bg-blue-50 text-blue-500' },
}

function fmtDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function fmtWeekday(s: string) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `星期${days[new Date(s + 'T00:00:00').getDay()]}`
}

function pad(n: number) { return String(n).padStart(2, '0') }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
  const { setOnAddAction } = useNav()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'anniversary' | 'birthday' | 'schedule'>('anniversary')
  const [formTitle, setFormTitle] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formRepeat, setFormRepeat] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const activePeriodStart = useMemo(() => getActivePeriod(events), [events])

  const displayDate = selectedDate ?? todayStr()

  const displayEvents = useMemo(() => {
    return events.filter((e) => {
      if (e.date === displayDate) return true
      if (e.repeat) {
        const [, em, ed] = e.date.split('-')
        const [, sm, sd] = displayDate.split('-')
        if (`${em}-${ed}` === `${sm}-${sd}`) return true
      }
      return false
    })
  }, [displayDate, events])

  useEffect(() => {
    setOnAddAction(() => setShowPicker(true))
    return () => setOnAddAction(null)
  }, [setOnAddAction])

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (ds: string) => {
    setSelectedDate(ds === selectedDate ? null : ds)
  }

  const handlePeriodStart = () => {
    addEvent({ type: 'period_start', title: '姨妈来了', date: displayDate })
    setShowPicker(false)
  }

  const handlePeriodEnd = () => {
    if (!activePeriodStart || displayDate < activePeriodStart) return
    addEvent({ type: 'period_end', title: '姨妈结束', date: displayDate })
    setShowPicker(false)
  }

  const openForm = (type: 'anniversary' | 'birthday' | 'schedule') => {
    setFormType(type)
    setFormTitle('')
    setFormNote('')
    setFormRepeat(type !== 'schedule')
    setShowPicker(false)
    setShowForm(true)
  }

  const handleSaveEvent = () => {
    if (!formTitle.trim()) return
    addEvent({
      type: formType,
      title: formTitle.trim(),
      date: displayDate,
      repeat: formRepeat,
      note: formNote.trim() || undefined,
    })
    setShowForm(false)
  }

  const handleDeleteEvent = (id: string, repeat: boolean) => {
    if (repeat) {
      setShowDeleteConfirm(id)
      return
    }
    deleteEvent(id)
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
  }

  const confirmDeleteOnce = () => {
    if (!showDeleteConfirm) return
    deleteEvent(showDeleteConfirm)
    setShowDeleteConfirm(null)
  }

  const isToday = displayDate === todayStr()

  return (
    <Fragment>
      <div className="px-5 pt-3 pb-2">
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
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <motion.div
          layout
          className="mt-3 bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div
            onClick={() => setSelectedDate(null)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer active:bg-gray-50 transition ${selectedDate ? '' : 'pointer-events-none'}`}
          >
            <div className="flex items-center gap-2">
              {isToday && (
                <span className="w-5 h-5 rounded-full bg-brand-pink text-white text-[10px] flex items-center justify-center font-semibold">今</span>
              )}
              <span className="text-sm font-semibold text-brand-text">{fmtDate(displayDate)}</span>
              <span className="text-xs text-gray-400">{fmtWeekday(displayDate)}</span>
            </div>
            {selectedDate && (
              <X size={14} className="text-gray-300" />
            )}
          </div>

          {displayEvents.length > 0 ? (
            <div className="px-4 pb-3 space-y-1.5">
              {displayEvents.map((ev) => {
                const meta = EVENT_LABEL[ev.type]
                return (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${meta?.color ?? 'bg-gray-50'}`}
                  >
                    <span className="text-base">{meta?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-text truncate">{ev.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <span>{meta?.label}</span>
                        {ev.repeat && <span>· 每年重复</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(ev.id, !!ev.repeat)}
                      className="p-1.5 active:scale-90 transition flex-shrink-0"
                    >
                      <Trash2 size={13} className="text-gray-300" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-300 text-center py-3">这一天还没有记录</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6"
              style={{ paddingBottom: 'calc(1rem + var(--safe-area-bottom, 0px))' }}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h2 className="text-base font-semibold text-brand-text text-center mb-5">添加事件</h2>

              <div className="space-y-2">
                {!events.some((e) => e.type === 'period_start' && e.date === displayDate) &&
                  displayDate !== activePeriodStart && (
                  <button
                    onClick={handlePeriodStart}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-pink-50 rounded-2xl active:scale-[0.98] transition"
                  >
                    <span className="text-lg">🩸</span>
                    <span className="text-sm font-medium text-pink-500">生理期开始</span>
                    <ChevronRight size={16} className="ml-auto text-pink-300" />
                  </button>
                )}
                {activePeriodStart && displayDate >= activePeriodStart &&
                  !events.some((e) => e.type === 'period_end' && e.date === displayDate) && (
                  <button
                    onClick={handlePeriodEnd}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-pink-50 rounded-2xl active:scale-[0.98] transition"
                  >
                    <span className="text-lg">🩸</span>
                    <span className="text-sm font-medium text-pink-500">生理期结束</span>
                    <ChevronRight size={16} className="ml-auto text-pink-300" />
                  </button>
                )}
                <button
                  onClick={() => openForm('anniversary')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 rounded-2xl active:scale-[0.98] transition"
                >
                  <span className="text-lg">❤️</span>
                  <span className="text-sm font-medium text-red-400">纪念日</span>
                  <ChevronRight size={16} className="ml-auto text-red-300" />
                </button>
                <button
                  onClick={() => openForm('birthday')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl active:scale-[0.98] transition"
                >
                  <span className="text-lg">🎂</span>
                  <span className="text-sm font-medium text-amber-500">生日</span>
                  <ChevronRight size={16} className="ml-auto text-amber-300" />
                </button>
                <button
                  onClick={() => openForm('schedule')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-2xl active:scale-[0.98] transition"
                >
                  <span className="text-lg">📅</span>
                  <span className="text-sm font-medium text-blue-500">日程</span>
                  <ChevronRight size={16} className="ml-auto text-blue-300" />
                </button>
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
                <button onClick={() => { setShowForm(false); setShowPicker(true) }} className="active:scale-95 transition">
                  <ChevronRight size={22} className="text-gray-400 rotate-180" />
                </button>
                <h2 className="text-base font-semibold text-brand-text">
                  {formType === 'anniversary' ? '添加纪念日' : formType === 'birthday' ? '添加生日' : '添加日程'}
                </h2>
                <div className="w-6" />
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
                    autoFocus
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
                  添加到 {fmtDate(displayDate)}
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
    </Fragment>
  )
}

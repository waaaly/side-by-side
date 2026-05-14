'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { CalendarEvent } from '@/types'

export function useCalendarEvents(pairId: string | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pairId) return
    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('pair_id', pairId)
        .order('date', { ascending: true })
      setEvents((data ?? []) as unknown as CalendarEvent[])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`events:${pairId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events', filter: `pair_id=eq.${pairId}` }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pairId])

  const addEvent = useCallback(async (data: {
    type: string; title: string; date: string; repeat?: boolean; note?: string
  }) => {
    if (!pairId) return null
    const supabase = createClient()
    const { data: created } = await supabase
      .from('calendar_events')
      .insert({ pair_id: pairId, ...data })
      .select()
      .single()
    return created as unknown as CalendarEvent | null
  }, [pairId])

  const updateEvent = useCallback(async (id: string, updates: {
    type?: string; title?: string; date?: string; repeat?: boolean; note?: string
  }) => {
    const supabase = createClient()
    await supabase.from('calendar_events').update(updates).eq('id', id)
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('calendar_events').delete().eq('id', id)
  }, [])

  return { events, addEvent, updateEvent, deleteEvent, loading }
}

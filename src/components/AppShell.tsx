'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthScreen from '@/components/AuthScreen'
import OfflineIndicator from '@/components/OfflineIndicator'
import BottomNav from '@/components/BottomNav'
import { NavProvider, useNav } from '@/contexts/NavContext'
import type { ReactNode } from 'react'

function ShellInner({ children }: { children: ReactNode }) {
  const { onAddExpense } = useNav()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-brand-cream safe-area-top">
      <OfflineIndicator />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav onAddExpense={onAddExpense ?? undefined} />
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  if (!user && pathname !== '/auth') {
    return (
      <div className="h-screen bg-brand-cream flex flex-col overflow-hidden safe-area-top">
        <OfflineIndicator />
        <AuthScreen />
      </div>
    )
  }

  return (
    <NavProvider>
      <ShellInner>{children}</ShellInner>
    </NavProvider>
  )
}

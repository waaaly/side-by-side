'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AuthScreen from '@/components/AuthScreen'
import OfflineIndicator from '@/components/OfflineIndicator'
import type { ReactNode } from 'react'

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
      <>
        <OfflineIndicator />
        <AuthScreen />
      </>
    )
  }

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  )
}

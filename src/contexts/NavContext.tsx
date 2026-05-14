'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface NavContextValue {
  onAddExpense: (() => void) | null
  setOnAddExpense: (fn: (() => void) | null) => void
}

const NavContext = createContext<NavContextValue>({
  onAddExpense: null,
  setOnAddExpense: () => {},
})

export function NavProvider({ children }: { children: ReactNode }) {
  const [onAddExpense, setOnAddExpense] = useState<(() => void) | null>(null)

  const setHandler = useCallback((fn: (() => void) | null) => {
    setOnAddExpense(() => fn)
  }, [])

  return (
    <NavContext.Provider value={{ onAddExpense, setOnAddExpense: setHandler }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}
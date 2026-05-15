'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface NavContextValue {
  onAddAction: (() => void) | null
  setOnAddAction: (fn: (() => void) | null) => void
}

const NavContext = createContext<NavContextValue>({
  onAddAction: null,
  setOnAddAction: () => {},
})

export function NavProvider({ children }: { children: ReactNode }) {
  const [onAddAction, setOnAddAction] = useState<(() => void) | null>(null)

  const setHandler = useCallback((fn: (() => void) | null) => {
    setOnAddAction(() => fn)
  }, [])

  return (
    <NavContext.Provider value={{ onAddAction, setOnAddAction: setHandler }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  return useContext(NavContext)
}

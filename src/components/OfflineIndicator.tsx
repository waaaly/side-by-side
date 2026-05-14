'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setOnline(navigator.onLine)

    const goOnline = () => { setOnline(true); setShow(true); setTimeout(() => setShow(false), 3000) }
    const goOffline = () => { setOnline(false); setShow(true) }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium ${
            online ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
          }`}
        >
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{online ? '网络已恢复，数据已同步' : '当前处于离线模式'}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

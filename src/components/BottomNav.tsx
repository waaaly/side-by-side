'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Receipt, ChefHat, Heart } from 'lucide-react'

const tabs = [
  { href: '/', label: '记账', icon: Receipt },
  { href: '/recipes', label: '厨房', icon: ChefHat },
  { href: '/us', label: '我们的', icon: Heart },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex items-center justify-around bg-white/80 backdrop-blur-lg border-t border-rose-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center py-2 px-6 active:scale-95 transition"
          >
            <motion.div
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? 'text-brand-pink' : 'text-gray-400'}
              />
            </motion.div>
            <span
              className={`text-xs mt-1 ${
                isActive ? 'text-brand-pink font-semibold' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-px w-8 h-0.5 bg-brand-pink rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

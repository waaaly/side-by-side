'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Receipt, ChefHat, Plus, Calendar, Settings } from 'lucide-react'

interface Props {
  onAddExpense?: () => void
}

const navItems = [
  { href: '/', label: '账单', icon: Receipt },
  { href: '/kitchen', label: '食谱', icon: ChefHat },
  { isAdd: true } as const,
  { href: '/calendar', label: '日历', icon: Calendar },
  { href: '/settings', label: '设置', icon: Settings },
] as const

export default function BottomNav({ onAddExpense }: Props) {
  const pathname = usePathname()

  return (
    <nav
      className="flex items-center justify-around bg-white/80 backdrop-blur-lg border-t border-rose-100"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      {navItems.map((item) => {
        if ('isAdd' in item) {
          return (
            <button
              key="add"
              onClick={onAddExpense}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-pink to-brand-rose text-white shadow-lg shadow-brand-pink/30 flex items-center justify-center -mt-5 active:scale-90 transition"
            >
              <Plus size={28} />
            </button>
          )
        }

        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center py-2 px-3 active:scale-95 transition"
          >
            <motion.div
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? 'text-brand-pink' : 'text-gray-400'}
              />
            </motion.div>
            <span
              className={`text-[10px] mt-1 ${
                isActive ? 'text-brand-pink font-semibold' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-px w-6 h-0.5 bg-brand-pink rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

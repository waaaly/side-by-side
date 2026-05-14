'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function UsPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart
              size={64}
              className="mx-auto text-brand-pink mb-4"
              fill="#FF8FA3"
            />
          </motion.div>
          <p className="text-brand-text text-lg font-semibold">属于我们的小世界</p>
          <p className="text-gray-400 text-sm mt-2">更多功能即将上线 ✨</p>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  )
}

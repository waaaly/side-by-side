'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star } from 'lucide-react'
import type { Recipe } from '@/types'

interface Props {
  recipe: Recipe
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
}

export default function RatingSheet({ recipe, open, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    await onSubmit(rating, comment.trim())
    setSubmitting(false)
    setRating(0)
    setComment('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
          >
            <div className="px-6 pt-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div />
                <h2 className="text-base font-semibold text-brand-text">打卡评分</h2>
                <button onClick={onClose} className="active:scale-95 transition">
                  <X size={22} className="text-gray-400" />
                </button>
              </div>

              <div className="text-center mb-4">
                <p className="text-lg font-medium text-brand-text mb-1">{recipe.name}</p>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHoveredStar(n)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(n)}
                    className="active:scale-90 transition"
                  >
                    <Star
                      size={32}
                      className={
                        n <= (hoveredStar || rating)
                          ? 'fill-brand-amber text-brand-amber'
                          : 'text-gray-200'
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="写句评价吧（选填）"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full text-sm text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-3 placeholder:text-gray-300 resize-none mb-4"
              />

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-40"
              >
                {submitting ? '提交中...' : '打卡！'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

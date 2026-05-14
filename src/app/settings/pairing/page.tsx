'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Link2, Heart } from 'lucide-react'
import Link from 'next/link'
import { createPair, joinPair, syncPairInfo, getStoredPairCode, getStoredPartnerId } from '@/lib/pairing'

export default function PairingSettingsPage() {
  const [pairCode, setPairCode] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const init = async () => {
      const info = await syncPairInfo()
      setPairCode(info.pairCode)
      setPartnerId(info.partnerId)
      setLoading(false)
    }
    init()
  }, [])

  const handleCreate = async () => {
    setLoading(true)
    const result = await createPair()
    if (result) {
      setPairCode(result.pairCode)
      setPartnerId(result.partnerId)
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    setJoinError(null)
    setJoinSuccess(false)
    if (!joinCode.trim()) return
    setLoading(true)
    const result = await joinPair(joinCode.trim())
    if (result) {
      setPairCode(result.pairCode)
      setPartnerId(result.partnerId)
      setJoinSuccess(true)
    } else {
      setJoinError('邀请码无效或已过期')
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (!pairCode) return
    navigator.clipboard.writeText(pairCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/settings" className="active:scale-95 transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-brand-text">💞 配对管理</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
          </div>
        ) : partnerId ? (
          /* ─── 已配对 ─── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-pink to-brand-rose flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-pink/20"
            >
              <Heart size={36} className="text-white" />
            </motion.div>
            <h2 className="text-lg font-bold text-brand-text mb-1">已成功配对 💕</h2>
            <p className="text-xs text-gray-400 mb-6">你们的数据已开始同步</p>

            {pairCode && (
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <p className="text-[10px] text-gray-400 mb-2">你的邀请码（对方可用此码加入）</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-center text-lg font-bold tracking-widest text-brand-pink bg-brand-pink/5 rounded-xl py-2.5">
                    {pairCode}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl active:scale-90 transition"
                  >
                    {copied ? <Check size={16} className="text-brand-sage" /> : <Copy size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ─── 未配对 ─── */
          <div className="space-y-5">
            {/* 创建配对 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-rose flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-pink/20">
                <Heart size={28} className="text-white" />
              </div>
              <h2 className="text-base font-semibold text-brand-text mb-1">创建配对</h2>
              <p className="text-xs text-gray-400 mb-4">生成邀请码，分享给你的伴侣</p>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-50"
              >
                生成邀请码
              </button>
            </motion.div>

            {/* 加入配对 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-sage/20 flex items-center justify-center">
                  <Link2 size={20} className="text-brand-sage" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-brand-text">加入配对</h2>
                  <p className="text-[10px] text-gray-400">输入伴侣的邀请码</p>
                </div>
              </div>

              <input
                type="text"
                placeholder="输入 6 位邀请码"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full text-center text-lg tracking-widest font-bold text-brand-text outline-none bg-gray-50 rounded-xl px-4 py-3 mb-3 placeholder:text-gray-200 placeholder:tracking-normal placeholder:font-normal"
              />

              {joinError && (
                <p className="text-xs text-brand-coral mb-3 text-center">{joinError}</p>
              )}
              {joinSuccess && (
                <p className="text-xs text-emerald-500 mb-3 text-center">🎉 配对成功！</p>
              )}

              <button
                onClick={handleJoin}
                disabled={loading || joinCode.length < 6}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition bg-gradient-to-r from-brand-sage to-brand-mint disabled:opacity-40"
              >
                加入
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Check, Heart, Link2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  createPair,
  joinPair,
  refreshPartnerInfo,
  unpair,
  getStoredPairCode,
  getStoredMyEmail,
  getStoredPartnerEmail,
  getStoredPairId,
  getCurrentUserId,
  isPaired,
} from '@/lib/pairing'

type PageState = 'init' | 'choose' | 'waiting' | 'paired'

export default function PairingSettingsPage() {
  const [pageState, setPageState] = useState<PageState>('init')
  const [loading, setLoading] = useState(true)
  const [pairCode, setPairCode] = useState<string | null>(null)
  const [myEmail, setMyEmail] = useState<string | null>(null)
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [showUnpairConfirm, setShowUnpairConfirm] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (isPaired()) {
        const info = await refreshPartnerInfo()
        setMyEmail(info.myEmail)
        setPartnerEmail(info.partnerEmail)
        setPageState('paired')
      } else {
        setPageState('choose')
      }
      setLoading(false)
    }
    init()
  }, [])

  // 监听伴侣加入（等待中状态）
  useEffect(() => {
    if (pageState !== 'waiting') return
    const pairId = getStoredPairId()
    if (!pairId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`pair-waiting:${pairId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pairs', filter: `id=eq.${pairId}` },
        async () => {
          const info = await refreshPartnerInfo()
          if (info.partnerExists) {
            setPartnerEmail(info.partnerEmail)
            setPageState('paired')
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pageState])

  const handleCreate = async () => {
    setLoading(true)
    const result = await createPair()
    if (result) {
      setPairCode(result.pairCode)
      setMyEmail(getStoredMyEmail())
      setPageState('waiting')
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    setJoinError(null)
    if (joinCode.trim().length < 6) return
    setLoading(true)
    const result = await joinPair(joinCode.trim())
    if (result) {
      setPairCode(result.pairCode)
      setPartnerEmail(result.partnerEmail)
      setMyEmail(getStoredMyEmail())
      setPageState('paired')
    } else {
      setJoinError('邀请码无效或已过期')
    }
    setLoading(false)
  }

  const handleCopy = useCallback(() => {
    if (!pairCode) return
    navigator.clipboard.writeText(pairCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [pairCode])

  const handleUnpair = async () => {
    setLoading(true)
    await unpair()
    setPageState('choose')
    setPairCode(null)
    setPartnerEmail(null)
    setShowUnpairConfirm(false)
    setLoading(false)
  }

  if (loading && pageState === 'init') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-pink/30 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-5 pt-3 pb-2">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="active:scale-95 transition">
          <ArrowLeft size={20} className="text-gray-400" />
        </Link>
        <h1 className="text-xl font-bold text-brand-text">💞 配对管理</h1>
      </div>

      {pageState === 'choose' && (
        <ChooseView
          onCreate={handleCreate}
          onJoin={handleJoin}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          joinError={joinError}
          loading={loading}
        />
      )}

      {pageState === 'waiting' && (
        <WaitingView
          pairCode={pairCode ?? ''}
          copied={copied}
          onCopy={handleCopy}
          onBack={() => { resetLocalState(); setPageState('choose') }}
        />
      )}

      {pageState === 'paired' && (
        <PairedView
          myEmail={myEmail}
          partnerEmail={partnerEmail}
          showUnpairConfirm={showUnpairConfirm}
          onShowUnpairConfirm={() => setShowUnpairConfirm(true)}
          onCancelUnpair={() => setShowUnpairConfirm(false)}
          onConfirmUnpair={handleUnpair}
        />
      )}
    </div>
  )
}

/* ─── 子组件 ───────────────────────────────── */

function resetLocalState() {
  // 只在内存中重置，不清除 localStorage
}

function ChooseView({
  onCreate, onJoin, joinCode, setJoinCode, joinError, loading,
}: {
  onCreate: () => void
  onJoin: () => void
  joinCode: string
  setJoinCode: (v: string) => void
  joinError: string | null
  loading: boolean
}) {
  return (
    <div className="space-y-4">
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
          onClick={onCreate}
          disabled={loading}
          className="w-full py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose disabled:opacity-50"
        >
          生成邀请码
        </button>
      </motion.div>

      {/* 分割线 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300">或者</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

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

        <AnimatePresence>
          {joinError && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-xs text-brand-coral mb-3 text-center"
            >
              {joinError}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          onClick={onJoin}
          disabled={loading || joinCode.length < 6}
          className="w-full py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition bg-gradient-to-r from-brand-sage to-brand-mint disabled:opacity-40"
        >
          加入
        </button>
      </motion.div>
    </div>
  )
}

function WaitingView({
  pairCode, copied, onCopy, onBack,
}: {
  pairCode: string
  copied: boolean
  onCopy: () => void
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-sm text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-rose flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-pink/20"
      >
        <Heart size={32} className="text-white" />
      </motion.div>

      <h2 className="text-base font-semibold text-brand-text mb-1">邀请码已生成</h2>
      <p className="text-xs text-gray-400 mb-6">将此邀请码分享给你的伴侣</p>

      <div className="flex items-center gap-3 mb-6 justify-center">
        <code className="text-2xl tracking-[0.3em] font-bold text-brand-pink bg-brand-pink/5 rounded-xl px-6 py-3">
          {pairCode}
        </code>
        <button
          onClick={onCopy}
          className="w-11 h-11 flex items-center justify-center bg-gray-50 rounded-xl active:scale-90 transition"
        >
          {copied ? <Check size={18} className="text-brand-sage" /> : <Copy size={18} className="text-gray-400" />}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 bg-brand-pink rounded-full"
        />
        <span className="text-xs text-gray-400">等待伴侣输入邀请码加入...</span>
      </div>

      <button
        onClick={onBack}
        className="text-xs text-gray-400 hover:text-gray-500 active:scale-95 transition"
      >
        ← 返回
      </button>
    </motion.div>
  )
}

function PairedView({
  myEmail, partnerEmail, showUnpairConfirm,
  onShowUnpairConfirm, onCancelUnpair, onConfirmUnpair,
}: {
  myEmail: string | null
  partnerEmail: string | null
  showUnpairConfirm: boolean
  onShowUnpairConfirm: () => void
  onCancelUnpair: () => void
  onConfirmUnpair: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-sm text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-pink to-brand-rose flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-pink/20"
      >
        <Heart size={40} className="text-white" />
      </motion.div>

      <h2 className="text-lg font-bold text-brand-text mb-1">已成功配对 💕</h2>
      <p className="text-xs text-gray-400 mb-6">你们的数据已开始同步</p>

      <div className="bg-brand-cream rounded-2xl p-4 mb-6 text-left">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-pink to-brand-rose flex items-center justify-center text-white text-sm">
            👩
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-brand-text truncate">
              {myEmail || '我'}
            </div>
            <div className="text-[10px] text-gray-400">我</div>
          </div>
        </div>
        <div className="border-t border-white/60 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-sage to-brand-mint flex items-center justify-center text-white text-sm">
              👨
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-brand-text truncate">
                {partnerEmail || '伴侣'}
              </div>
              <div className="text-[10px] text-gray-400">伴侣</div>
            </div>
          </div>
        </div>
      </div>

      {showUnpairConfirm ? (
        <div className="space-y-2">
          <p className="text-xs text-brand-coral mb-2">确定要解除配对吗？双方数据将不再同步。</p>
          <div className="flex gap-2">
            <button
              onClick={onCancelUnpair}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 active:scale-95 transition"
            >
              取消
            </button>
            <button
              onClick={onConfirmUnpair}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-coral active:scale-95 transition"
            >
              确认解除
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onShowUnpairConfirm}
          className="flex items-center gap-1.5 mx-auto text-xs text-gray-400 hover:text-brand-coral active:scale-95 transition"
        >
          <LogOut size={12} />
          解除配对
        </button>
      )}
    </motion.div>
  )
}

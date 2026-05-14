'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Heart, KeyRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

const INVITE_CODE = process.env.NEXT_PUBLIC_INVITE_CODE || ''
const VERIFY_CODE = process.env.NEXT_PUBLIC_VERIFY_CODE || ''

type Mode = 'login' | 'register'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || password.length < 6) {
      setError('邮箱和密码必填，密码至少 6 位')
      return
    }
    if (mode === 'register') {
      if (INVITE_CODE && inviteCode !== INVITE_CODE) {
        setError('邀请码不正确')
        return
      }
      if (VERIFY_CODE && verifyCode !== VERIFY_CODE) {
        setError('验证码不正确')
        return
      }
    }
    setSubmitting(true)
    if (mode === 'login') {
      const err = await signIn(email.trim(), password)
      if (err) setError(err)
    } else {
      const err = await signUp(email.trim(), password)
      if (err) {
        setError(err)
      } else {
        setRegistered(true)
      }
    }
    setSubmitting(false)
  }

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError(null)
    setRegistered(false)
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl shadow-brand-pink/10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-rose flex items-center justify-center mx-auto mb-4"
          >
            <Mail size={28} className="text-white" />
          </motion.div>
          <h2 className="text-lg font-bold text-brand-text mb-2">注册成功！</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            验证邮件已发送到
            <br />
            <span className="font-medium text-brand-text">{email}</span>
            <br />
            请查收邮件并点击确认链接完成注册
          </p>
          <button
            onClick={() => { setMode('login'); setRegistered(false) }}
            className="mt-6 text-sm text-brand-pink font-medium active:scale-95 transition"
          >
            返回登录
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-pink to-brand-rose shadow-lg shadow-brand-pink/30 flex items-center justify-center mx-auto mb-4"
          >
            <Heart size={36} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-brand-text"
          >
            Side by Side
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400 mt-1"
          >
            属于我们的小世界
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 shadow-xl shadow-brand-pink/10"
        >
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(null) }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-white text-brand-text shadow-sm' : 'text-gray-400'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(null) }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-white text-brand-text shadow-sm' : 'text-gray-400'
              }`}
            >
              注册
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-brand-coral bg-brand-coral/5 rounded-xl px-3 py-2 mb-4">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">邮箱</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-brand-text outline-none placeholder:text-gray-300"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="至少 6 位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl text-sm text-brand-text outline-none placeholder:text-gray-300"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 active:scale-90 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                {INVITE_CODE && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">邀请码</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        placeholder="请输入邀请码"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-brand-text outline-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                )}
                {VERIFY_CODE && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">验证码</label>
                    <div className="relative">
                      <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        placeholder="请输入验证码"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-brand-text outline-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-base active:scale-95 transition bg-gradient-to-r from-brand-pink to-brand-rose shadow-lg shadow-brand-pink/20 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                  />
                  处理中...
                </span>
              ) : mode === 'login' ? (
                '登录'
              ) : (
                '注册'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-[10px] text-gray-300 text-center mt-4 leading-relaxed">
              还没有账号？{' '}
              <button onClick={toggleMode} className="text-brand-pink font-medium active:scale-95 transition">
                立即注册
              </button>
            </p>
          )}
        </motion.div>

        <p className="text-[10px] text-gray-300 text-center mt-6">
          登录即表示同意我们的服务条款
        </p>
      </motion.div>
    </div>
  )
}

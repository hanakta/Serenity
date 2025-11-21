'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2,
  Shield,
  Chrome,
  Github,
  Apple
} from 'lucide-react'

interface LoginFormProps {
  email: string
  password: string
  showPassword: boolean
  rememberMe: boolean
  isLoading: boolean
  error: string | null
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onShowPasswordToggle: () => void
  onRememberMeChange: (remember: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  onForgotPassword: () => void
  onSocialLogin: (provider: 'google' | 'github' | 'apple') => void
  onEnable2FA: () => void
}

export default function LoginForm({
  email,
  password,
  showPassword,
  rememberMe,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
  onSocialLogin,
  onEnable2FA
}: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-slate-300 text-sm font-medium mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            id="email"
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-2">
          Пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            placeholder="Ваш пароль"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Дополнительные опции */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-slate-300 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span>Запомнить меня</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Забыли пароль?
        </button>
      </div>

      {/* Вход через социальные сети */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Или войдите через</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            type="button"
            onClick={() => onSocialLogin('google')}
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Chrome className="w-4 h-4" />
            <span className="text-xs">Google</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onSocialLogin('github')}
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github className="w-4 h-4" />
            <span className="text-xs">GitHub</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onSocialLogin('apple')}
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Apple className="w-4 h-4" />
            <span className="text-xs">Apple</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center"
        >
          {error}
        </motion.div>
      )}
      
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold transition-all duration-300 hover:from-blue-600 hover:to-purple-700 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Вход...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Войти в систему</span>
          </>
        )}
      </motion.button>

      {/* 2FA опция */}
      <div className="text-center">
        <button
          type="button"
          onClick={onEnable2FA}
          className="text-slate-400 hover:text-blue-400 text-sm transition-colors flex items-center justify-center space-x-1 mx-auto"
        >
          <Shield className="w-4 h-4" />
          <span>Включить двухфакторную аутентификацию</span>
        </button>
      </div>
    </form>
  )
}















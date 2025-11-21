'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Loader2
} from 'lucide-react'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'

interface RegisterFormProps {
  name: string
  email: string
  password: string
  showPassword: boolean
  isLoading: boolean
  error: string | null
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onShowPasswordToggle: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function RegisterForm({
  name,
  email,
  password,
  showPassword,
  isLoading,
  error,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onSubmit
}: RegisterFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="reg-name" className="block text-slate-300 text-sm font-medium mb-2">
          Имя
        </label>
        <div className="relative">
          <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            id="reg-name"
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-slate-300 text-sm font-medium mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            id="reg-email"
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-slate-300 text-sm font-medium mb-2">
          Пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            id="reg-password"
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
        {/* Индикатор силы пароля */}
        <PasswordStrengthIndicator password={password} />
      </div>

      {/* Согласие с условиями */}
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="terms"
          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
          required
        />
        <label htmlFor="terms" className="text-slate-300 text-sm">
          Я согласен с{' '}
          <button type="button" className="text-blue-400 hover:text-blue-300 underline">
            условиями использования
          </button>{' '}
          и{' '}
          <button type="button" className="text-blue-400 hover:text-blue-300 underline">
            политикой конфиденциальности
          </button>
        </label>
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
            <span>Регистрация...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Создать аккаунт</span>
          </>
        )}
      </motion.button>
    </form>
  )
}

'use client'

import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'

interface AuthTabSwitcherProps {
  showRegister: boolean
  onToggle: (showRegister: boolean) => void
}

export default function AuthTabSwitcher({ showRegister, onToggle }: AuthTabSwitcherProps) {
  return (
    <div className="flex mb-8 bg-slate-700/50 rounded-2xl p-1">
      <button
        onClick={() => onToggle(false)}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
          !showRegister
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <LogIn className="w-4 h-4 mr-2 inline" />
        Вход
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
          showRegister
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <UserPlus className="w-4 h-4 mr-2 inline" />
        Регистрация
      </button>
    </div>
  )
}















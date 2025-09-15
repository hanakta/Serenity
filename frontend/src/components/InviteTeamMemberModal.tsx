'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, UserPlus, Loader } from 'lucide-react'
import { useInvitations } from '@/hooks/useInvitations'

interface InviteTeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  teamName: string
  onInviteSent?: () => void
}

export const InviteTeamMemberModal: React.FC<InviteTeamMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  onInviteSent
}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const { loading, error, sendInvitation } = useInvitations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      return
    }

    try {
      await sendInvitation(teamId, email.trim(), role)
      
      // Сброс формы
      setEmail('')
      setRole('member')
      
      // Уведомляем о успешной отправке
      onInviteSent?.()
      
      // Закрываем модальное окно
      onClose()
    } catch (err) {
      // Ошибка обрабатывается в хуке
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('member')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Пригласить участника
                </h3>
                <p className="text-white/70 text-sm">
                  в команду &quot;{teamName}&quot;
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email адрес
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Роль в команде
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    role === 'member' 
                      ? 'border-blue-400 bg-blue-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}>
                    <input
                      type="radio"
                      value="member"
                      checked={role === 'member'}
                      onChange={(e) => setRole(e.target.value as 'member')}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">Участник</p>
                      <p className="text-white/60 text-xs">Базовые права</p>
                    </div>
                  </label>
                  
                  <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    role === 'admin' 
                      ? 'border-purple-400 bg-purple-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}>
                    <input
                      type="radio"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={(e) => setRole(e.target.value as 'admin')}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">Админ</p>
                      <p className="text-white/60 text-xs">Полные права</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Отправить приглашение</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

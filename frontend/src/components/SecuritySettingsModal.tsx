'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Lock, Key, Eye, EyeOff, CheckCircle, AlertTriangle, Smartphone, Monitor } from 'lucide-react'

interface SecuritySettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onPasswordChange: (data: { currentPassword: string; newPassword: string }) => Promise<void>
}

export default function SecuritySettingsModal({ isOpen, onClose, onPasswordChange }: SecuritySettingsModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Текущий пароль обязателен'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Новый пароль обязателен'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Пароль должен содержать минимум 8 символов'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать заглавные и строчные буквы, а также цифры'
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Новый пароль должен отличаться от текущего'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onPasswordChange({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      
      setSuccess(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Ошибка изменения пароля:', error)
      setErrors({ submit: 'Неверный текущий пароль' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }))
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-glow overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-8 border-b border-slate-700/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))",
                  "linear-gradient(45deg, rgba(20, 184, 166, 0.1), rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))",
                  "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1), rgba(34, 197, 94, 0.1))",
                  "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))"
                ]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Shield className="w-8 h-8 text-green-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Настройки безопасности</h2>
                  <p className="text-slate-400">Управляйте паролем и доступом</p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-8 mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold">Пароль успешно изменен!</h3>
                  <p className="text-green-300 text-sm">Ваш аккаунт теперь защищен новым паролем</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Текущий пароль
              </label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-700/50 border rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.currentPassword 
                      ? 'border-red-500/50 focus:ring-red-500/30' 
                      : 'border-slate-600/50 focus:ring-green-500/30 focus:border-green-500/50'
                  }`}
                  placeholder="Введите текущий пароль"
                />
                <motion.button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </motion.div>
              {errors.currentPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.currentPassword}
                </motion.p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Новый пароль
              </label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-700/50 border rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.newPassword 
                      ? 'border-red-500/50 focus:ring-red-500/30' 
                      : 'border-slate-600/50 focus:ring-green-500/30 focus:border-green-500/50'
                  }`}
                  placeholder="Введите новый пароль"
                />
                <motion.button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </motion.div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i < passwordStrength 
                            ? passwordStrength <= 2 
                              ? 'bg-red-500' 
                              : passwordStrength <= 3 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            : 'bg-slate-700'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i < passwordStrength ? 1 : 0 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength <= 2 ? 'text-red-400' : 
                    passwordStrength <= 3 ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    {passwordStrength <= 2 ? 'Слабый пароль' : 
                     passwordStrength <= 3 ? 'Средний пароль' : 
                     'Сильный пароль'}
                  </p>
                </motion.div>
              )}
              
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.newPassword}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Подтвердите новый пароль
              </label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-700/50 border rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.confirmPassword 
                      ? 'border-red-500/50 focus:ring-red-500/30' 
                      : 'border-slate-600/50 focus:ring-green-500/30 focus:border-green-500/50'
                  }`}
                  placeholder="Подтвердите новый пароль"
                />
                <motion.button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </motion.div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Security Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>Рекомендации по безопасности</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Используйте минимум 8 символов</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Включите заглавные и строчные буквы</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Добавьте цифры и специальные символы</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>Не используйте личную информацию</span>
                </li>
              </ul>
            </motion.div>

            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Активные сессии</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-white">Текущее устройство</p>
                      <p className="text-xs text-slate-400">Chrome на macOS</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-white">iPhone 14 Pro</p>
                      <p className="text-xs text-slate-400">2 часа назад</p>
                    </div>
                  </div>
                  <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Завершить
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center space-x-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Отмена
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Изменить пароль</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


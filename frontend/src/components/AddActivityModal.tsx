'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; category: string }) => Promise<void>
  loading?: boolean
}

const categories = [
  { value: 'general', label: 'Общее', icon: '📝' },
  { value: 'meeting', label: 'Встреча', icon: '🤝' },
  { value: 'milestone', label: 'Достижение', icon: '🎯' },
  { value: 'announcement', label: 'Объявление', icon: '📢' },
  { value: 'idea', label: 'Идея', icon: '💡' },
  { value: 'feedback', label: 'Обратная связь', icon: '💬' },
  { value: 'update', label: 'Обновление', icon: '🔄' },
  { value: 'celebration', label: 'Празднование', icon: '🎉' }
]

export default function AddActivityModal({ isOpen, onClose, onSubmit, loading = false }: AddActivityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Название слишком длинное (максимум 255 символов)'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Описание слишком длинное (максимум 1000 символов)'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    
    try {
      await onSubmit(formData)
      setFormData({ title: '', description: '', category: 'general' })
      onClose()
    } catch (error) {
      console.error('Ошибка создания активности:', error)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', description: '', category: 'general' })
    setErrors({})
    onClose()
  }

  const selectedCategory = categories.find(cat => cat.value === formData.category)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md mx-4 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Добавить активность</h2>
                  <p className="text-sm text-slate-400">Создайте новую активность для команды</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-300">
                  Название активности *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название активности..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  maxLength={255}
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-slate-300">
                  Категория
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value} className="bg-slate-800 text-white">
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-300">
                  Описание *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Опишите детали активности..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px] resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-sm text-red-400">{errors.description}</p>
                  )}
                  <p className="text-xs text-slate-500 ml-auto">
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Создание...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Создать</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

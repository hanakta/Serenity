'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Task, PRIORITY_OPTIONS, CATEGORY_OPTIONS, STATUS_OPTIONS } from '@/lib/utils'
import { X, Loader2, Sparkles, Calendar, Flag, Tag } from 'lucide-react'

interface PremiumTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: Partial<Task>) => Promise<void>
  task?: Task | null
  mode?: 'create' | 'edit'
  isLoading?: boolean
}

export default function PremiumTaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  task, 
  mode = 'create', 
  isLoading = false 
}: PremiumTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed' | 'cancelled'>('todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [category, setCategory] = useState<'personal' | 'work' | 'health' | 'learning' | 'shopping' | 'other'>('personal')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setCategory(task.category)
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '')
    } else {
      setTitle('')
      setDescription('')
      setStatus('todo')
      setPriority('medium')
      setCategory('personal')
      setDueDate('')
    }
    setError(null)
  }, [task, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Название задачи не может быть пустым.')
      return
    }

    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      category,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    }

    console.log('Sending task data:', taskData)

    try {
      await onSave(taskData)
      onClose()
    } catch (err: any) {
      console.error('Task save error:', err)
      setError(err.message || 'Неизвестная ошибка при сохранении задачи.')
    }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 50 }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-xs sm:max-w-2xl max-h-[30vh] overflow-y-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg sm:rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-large"
          >
            {/* Animated background */}
            <div className="absolute inset-0 rounded-lg sm:rounded-3xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-1.5 sm:p-8 border-b border-slate-700/50">
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <div className="p-1.5 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md sm:rounded-xl">
                  <Sparkles className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-2xl font-bold text-white">
                    {mode === 'create' ? 'Создать задачу' : 'Редактировать задачу'}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">
                    {mode === 'create' ? 'Добавьте новую задачу в ваш список' : 'Обновите информацию о задаче'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                disabled={isLoading}
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 p-1.5 sm:p-8 space-y-1.5 sm:space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">Название задачи *</Label>
                <div className="relative">
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название задачи"
                    disabled={isLoading}
                    required
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Добавьте описание задачи (необязательно)"
                  disabled={isLoading}
                  rows={3}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              {/* Status, Priority, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white font-medium flex items-center space-x-2">
                    <Flag className="w-4 h-4" />
                    <span>Статус</span>
                  </Label>
                  <Select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500/50"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-white font-medium flex items-center space-x-2">
                    <Flag className="w-4 h-4" />
                    <span>Приоритет</span>
                  </Label>
                  <Select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500/50"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white font-medium flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>Категория</span>
                  </Label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500/50"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-white font-medium flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Срок выполнения</span>
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-1.5 sm:space-y-0 sm:space-x-4 pt-1.5 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 text-sm sm:text-base"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim()}
                  className="w-full sm:w-auto px-3 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                      {mode === 'create' ? 'Создание...' : 'Сохранение...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {mode === 'create' ? 'Создать задачу' : 'Сохранить изменения'}
                    </>
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

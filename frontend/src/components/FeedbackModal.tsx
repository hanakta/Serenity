'use client'

import { useState, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Star, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Heart,
  Send,
  CheckCircle
} from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => void
}

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general'
  rating: number
  message: string
  email?: string
}

const FeedbackModal = memo(function FeedbackModal({
  isOpen,
  onClose,
  onSubmit
}: FeedbackModalProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general',
    rating: 5,
    message: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackTypes = [
    { id: 'bug', label: 'Ошибка', icon: Bug, color: 'text-red-400' },
    { id: 'feature', label: 'Функция', icon: Lightbulb, color: 'text-blue-400' },
    { id: 'improvement', label: 'Улучшение', icon: Star, color: 'text-yellow-400' },
    { id: 'general', label: 'Общее', icon: MessageSquare, color: 'text-slate-400' }
  ]

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(feedback)
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
        setFeedback({
          type: 'general',
          rating: 5,
          message: '',
          email: ''
        })
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [feedback, onSubmit, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Спасибо за отзыв!
              </h3>
              <p className="text-slate-300">
                Ваше сообщение отправлено. Мы обязательно его рассмотрим.
              </p>
            </motion.div>
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                    <Heart className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Обратная связь
                    </h3>
                    <p className="text-sm text-slate-400">
                      Помогите нам улучшить приложение
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Тип сообщения
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = feedback.type === type.id
                      
                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedback(prev => ({ ...prev, type: type.id as any }))}
                          className={`
                            flex items-center space-x-2 p-3 rounded-lg border transition-all duration-300
                            ${isSelected 
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-white' 
                              : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/70'
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : type.color}`} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Оценка приложения
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <motion.button
                        key={rating}
                        type="button"
                        onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                        className="p-1"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors duration-200 ${
                            rating <= feedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-600'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    value={feedback.message}
                    onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Расскажите нам о вашем опыте использования..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email (необязательно)
                  </label>
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!feedback.message.trim() || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-3 px-4 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Отправка...' : 'Отправить отзыв'}</span>
                </motion.button>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

export default FeedbackModal








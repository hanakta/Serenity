'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, 
  Users, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  X,
  Sparkles,
  Target,
  Clock,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  Star
} from 'lucide-react'

interface OnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  features: string[]
  action?: string
  color: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Serenity',
    description: 'Ваш персональный менеджер задач с искусственным интеллектом',
    icon: Sparkles,
    features: [
      'Умное планирование задач',
      'Красивый современный дизайн',
      'Командная работа',
      'Аналитика продуктивности'
    ],
    action: 'Начать путешествие',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'tasks',
    title: 'Управление задачами',
    description: 'Создавайте, организуйте и отслеживайте свои задачи',
    icon: CheckSquare,
    features: [
      'Создание задач с приоритетами',
      'Категоризация и теги',
      'Напоминания и дедлайны',
      'Статусы выполнения'
    ],
    action: 'Создать первую задачу',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'focus',
    title: 'Pomodoro таймер',
    description: 'Повышайте продуктивность с помощью техники Pomodoro',
    icon: Clock,
    features: [
      '25-минутные рабочие сессии',
      'Короткие и длинные перерывы',
      'Статистика продуктивности',
      'Звуковые уведомления'
    ],
    action: 'Попробовать таймер',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'teams',
    title: 'Командная работа',
    description: 'Создавайте команды и работайте вместе',
    icon: Users,
    features: [
      'Создание команд',
      'Приглашение участников',
      'Общие задачи и проекты',
      'Чат в реальном времени'
    ],
    action: 'Создать команду',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'analytics',
    title: 'Аналитика и статистика',
    description: 'Отслеживайте свой прогресс и продуктивность',
    icon: BarChart3,
    features: [
      'Графики выполнения задач',
      'Статистика времени',
      'Анализ продуктивности',
      'Отчеты по периодам'
    ],
    action: 'Посмотреть статистику',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'complete',
    title: 'Готово к использованию!',
    description: 'Теперь вы знаете все основные возможности Serenity',
    icon: Star,
    features: [
      'Все функции разблокированы',
      'Начните создавать задачи',
      'Пригласите команду',
      'Настройте под себя'
    ],
    action: 'Начать использовать',
    color: 'from-orange-500 to-yellow-600'
  }
]

export default function Onboarding({ isOpen, onClose, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
      onClose()
    }, 300)
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const currentStepData = onboardingSteps[currentStep]
  const Icon = currentStepData.icon

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isVisible && (
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
            onClick={handleSkip}
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
            <div className="relative p-6 border-b border-slate-700/50">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
                    "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
                    "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
                    "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className={`p-3 bg-gradient-to-br ${currentStepData.color} rounded-2xl`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
                    <p className="text-slate-400">{currentStepData.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Features List */}
                <div className="space-y-3">
                  {currentStepData.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                      <span className="text-slate-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Шаг {currentStep + 1} из {onboardingSteps.length}</span>
                    <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <motion.div
                      className={`h-2 bg-gradient-to-r ${currentStepData.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center space-x-2">
                  {onboardingSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-125' 
                          : 'bg-slate-600'
                      }`}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/50 p-6 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    currentStep === 0
                      ? 'opacity-50 cursor-not-allowed text-slate-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </motion.button>

                <motion.button
                  onClick={handleNext}
                  className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${currentStepData.color} text-white rounded-xl transition-all duration-300 hover:shadow-glow`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{currentStepData.action}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}















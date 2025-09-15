'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Target,
  Heart,
  Sparkles,
  Globe,
  Lock,
  CheckSquare,
  Calendar,
  FileText,
  User,
  GraduationCap,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Smartphone,
  Key,
  Github,
  Chrome,
  Apple,
  Languages,
  Save,
  Trash2,
  Info,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Users2,
  Activity,
  Award,
  MessageCircle,
  HelpCircle,
  Settings,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal
} from 'lucide-react'

// Анимированные частицы
const Particle = ({ index }: { index: number }) => {
  // Используем индекс для стабильных значений вместо Math.random()
  const size = (index * 0.3) % 4 + 2
  const duration = (index * 0.7) % 15 + 10
  const delay = (index * 0.2) % 5
  const x = (index * 0.4) % 100
  const y = (index * 0.6) % 100

  return (
    <motion.div
      className="absolute bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-sm"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, (index * 0.3) % 30 - 15, 0],
        x: [0, (index * 0.5) % 30 - 15, 0],
        opacity: [0.1, 0.6, 0.1],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
    />
  )
}

// Компонент для уведомлений (Toast)
const Toast = ({ message, type, isVisible, onClose }: { 
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning', 
  isVisible: boolean, 
  onClose: () => void 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30'
      case 'error': return 'bg-red-500/10 border-red-500/30'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info': return 'bg-blue-500/10 border-blue-500/30'
      default: return 'bg-blue-500/10 border-blue-500/30'
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border backdrop-blur-xl shadow-large ${getBgColor()}`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="text-white font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Компонент для индикатора силы пароля
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return Math.min(score, 5)
  }

  const strength = getStrength(password)
  const strengthLabels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? strengthColors[strength - 1] : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-slate-400">
        {strengthLabels[strength - 1] || 'Очень слабый'}
      </div>
    </div>
  )
}

// Компонент для переключателя темы
const ThemeToggle = ({ isDark, onToggle }: { isDark: boolean, onToggle: () => void }) => {
  return (
    <motion.button
      onClick={onToggle}
      className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  )
}

// Компонент для языкового переключателя
const LanguageToggle = ({ language, onLanguageChange }: { 
  language: string, 
  onLanguageChange: (lang: string) => void 
}) => {
  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ]

  const [isOpen, setIsOpen] = useState(false)
  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-large z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  language === lang.code ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && <CheckCircle2 className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Компонент для живых статистик
const LiveStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    projects: 0,
    uptime: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        tasks: prev.tasks + Math.floor(Math.random() * 5),
        projects: prev.projects + Math.floor(Math.random() * 2),
        uptime: prev.uptime + 1
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}д ${hours}ч ${minutes}м`
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <motion.div
        className="text-center p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-soft"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-2xl font-bold text-white gradient-text">
          {stats.users.toLocaleString()}+
        </div>
        <div className="text-slate-400 text-sm">Пользователей</div>
      </motion.div>
      <motion.div
        className="text-center p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-soft"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-2xl font-bold text-white gradient-text">
          {stats.tasks.toLocaleString()}+
        </div>
        <div className="text-slate-400 text-sm">Задач</div>
      </motion.div>
      <motion.div
        className="text-center p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-soft"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-2xl font-bold text-white gradient-text">
          {stats.projects.toLocaleString()}+
        </div>
        <div className="text-slate-400 text-sm">Проектов</div>
      </motion.div>
      <motion.div
        className="text-center p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-soft"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-2xl font-bold text-white gradient-text">
          {formatUptime(stats.uptime)}
        </div>
        <div className="text-slate-400 text-sm">Время работы</div>
      </motion.div>
    </div>
  )
}

// Компонент для демо-тура
const DemoTour = ({ isActive, onClose }: { isActive: boolean, onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    {
      title: "Добро пожаловать в Serenity!",
      description: "Это ваш персональный менеджер задач с ИИ-ассистентом",
      target: "hero-section"
    },
    {
      title: "Безопасная авторизация",
      description: "Войдите через социальные сети или создайте аккаунт",
      target: "auth-form"
    },
    {
      title: "Мощные возможности",
      description: "Управляйте задачами, проектами и командой",
      target: "features-section"
    },
    {
      title: "Готово к использованию!",
      description: "Начните создавать свои первые задачи",
      target: "cta-section"
    }
  ]

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-large p-6 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-slate-300 text-sm">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-500' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1 py-2 px-4 bg-slate-700/50 text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={() => {
              if (currentStep === steps.length - 1) {
                onClose()
              } else {
                setCurrentStep(currentStep + 1)
              }
            }}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Навигационное меню
const Navigation = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
  const [activeSection, setActiveSection] = useState('')
  const router = useRouter()

  const menuItems = [
    { id: 'features', label: 'Возможности', icon: Zap },
    { id: 'about', label: 'О нас', icon: Users },
    { id: 'support', label: 'Поддержка', icon: Heart },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
    setIsOpen(false)
  }

  const handlePricingClick = () => {
    router.push('/pricing')
    setIsOpen(false)
  }

  return (
    <>
      {/* Мобильное меню */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Serenity</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                {/* Кнопка Цены */}
                <button
                  onClick={handlePricingClick}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 hover:text-purple-300"
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium">Цены</span>
                </button>
                
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                        activeSection === item.id
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Десктопное меню */}
      <nav className="hidden lg:flex items-center space-x-8">
        {/* Кнопка Цены */}
        <button
          onClick={handlePricingClick}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 hover:text-purple-300"
        >
          <Star className="w-4 h-4" />
          <span className="font-medium">Цены</span>
        </button>
        
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                activeSection === item.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

// Карточка функции с крутыми анимациями
const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    className="group relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient overflow-hidden"
    initial={{ opacity: 0, y: 30, rotateX: -15 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
    whileHover={{ 
      y: -15, 
      scale: 1.05, 
      rotateY: 5,
      rotateX: -5,
      transition: { duration: 0.4, type: "spring", stiffness: 300 }
    }}
    style={{ transformStyle: "preserve-3d" }}
  >
    {/* Анимированный переливающийся фон */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"
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
    
    {/* Плавающие частицы */}
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-3xl"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: 6 }).map((_, i) => {
        // Фиксированные позиции для предотвращения hydration mismatch
        const positions = [
          { left: 15, top: 20 },
          { left: 85, top: 30 },
          { left: 25, top: 70 },
          { left: 75, top: 80 },
          { left: 50, top: 15 },
          { left: 10, top: 60 }
        ];
        const pos = positions[i] || { left: 50, top: 50 };
        
        return (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            scale: [0.5, 1, 0.5],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2 + (i * 0.3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2
          }}
        />
        );
      })}
    </motion.div>

    {/* Светящийся эффект при наведении */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0"
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />

    {/* Основной контент */}
    <div className="relative z-10 text-center">
      <motion.div 
        className="inline-flex p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 shadow-soft"
        whileHover={{ 
          scale: 1.1, 
          rotate: 360,
          transition: { duration: 0.6, type: "spring", stiffness: 200 }
        }}
      >
        <motion.div
          whileHover={{ 
            scale: 1.2,
            transition: { duration: 0.3 }
          }}
        >
          <Icon className="w-8 h-8 text-blue-400" />
        </motion.div>
      </motion.div>
      
      <motion.h3 
        className="text-xl font-bold text-white mb-3"
        whileHover={{ 
          scale: 1.05,
          color: "#60a5fa",
          transition: { duration: 0.3 }
        }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-slate-300 text-sm leading-relaxed"
        whileHover={{ 
          color: "#cbd5e1",
          transition: { duration: 0.3 }
        }}
      >
        {description}
      </motion.p>
    </div>

    {/* Анимированная рамка */}
    <motion.div
      className="absolute inset-0 rounded-3xl border-2 border-transparent"
      whileHover={{
        borderImage: "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1",
        transition: { duration: 0.3 }
      }}
    />
  </motion.div>
)


// Карточка команды с крутыми анимациями
const TeamCard = ({ name, role, avatar, delay }: { 
  name: string, 
  role: string, 
  avatar: string, 
  delay: number 
}) => (
  <motion.div
    className="group text-center p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient overflow-hidden"
    initial={{ opacity: 0, y: 30, rotateY: -15 }}
    animate={{ opacity: 1, y: 0, rotateY: 0 }}
    transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
    whileHover={{ 
      y: -15, 
      scale: 1.05, 
      rotateY: 5,
      rotateX: -5,
      transition: { duration: 0.4, type: "spring", stiffness: 300 }
    }}
    style={{ transformStyle: "preserve-3d" }}
  >
    {/* Анимированный переливающийся фон */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"
      animate={{
        background: [
          "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
          "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
          "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
          "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))"
        ]
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    />

    {/* Плавающие частицы */}
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-3xl"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 25 - 12.5, 0],
            scale: [0.3, 1, 0.3],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </motion.div>

    <div className="relative z-10">
      <motion.div 
        className="relative mb-6"
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.3 }
        }}
      >
        <motion.div 
          className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-4xl shadow-soft relative overflow-hidden"
          whileHover={{ 
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
            transition: { duration: 0.3 }
          }}
        >
          {/* Анимированный фон аватара */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
                "linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))",
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Вращающийся аватар */}
          <motion.div
            className="relative z-10"
            whileHover={{ 
              rotate: 360,
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
          >
            {avatar}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.h3 
        className="text-xl font-bold text-white mb-2"
        whileHover={{ 
          scale: 1.05,
          color: "#60a5fa",
          transition: { duration: 0.3 }
        }}
      >
        {name}
      </motion.h3>
      
      <motion.p 
        className="text-slate-400"
        whileHover={{ 
          color: "#cbd5e1",
          transition: { duration: 0.3 }
        }}
      >
        {role}
      </motion.p>
    </div>

    {/* Анимированная рамка */}
    <motion.div
      className="absolute inset-0 rounded-3xl border-2 border-transparent"
      whileHover={{
        borderImage: "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1",
        transition: { duration: 0.3 }
      }}
    />
  </motion.div>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [language, setLanguage] = useState('ru')
  const [showDemoTour, setShowDemoTour] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'warning', isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  })
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [isFormDirty, setIsFormDirty] = useState(false)
  const { user, login, register } = useAuth()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (user) {
      console.log('User logged in, redirecting to home page...', user);
      // Небольшая задержка для стабильности
      setTimeout(() => {
        router.push('/')
      }, 100);
    }
  }, [user, router])

  // Автосохранение данных формы
  useEffect(() => {
    const savedFormData = localStorage.getItem('loginFormData')
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData)
      setEmail(parsed.email || '')
      setPassword(parsed.password || '')
      setName(parsed.name || '')
      setFormData(parsed)
    }
  }, [])

  // Сохранение данных формы при изменении
  useEffect(() => {
    if (isFormDirty) {
      const formData = { email, password, name }
      localStorage.setItem('loginFormData', JSON.stringify(formData))
      setFormData(formData)
    }
  }, [email, password, name, isFormDirty])

  // Очистка сохраненных данных при успешном входе
  const clearSavedData = () => {
    localStorage.removeItem('loginFormData')
    setFormData({ email: '', password: '', name: '' })
    setIsFormDirty(false)
  }

  // Показ уведомления
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type, isVisible: true })
  }

  // Закрытие уведомления
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  // Вход через социальные сети
  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple') => {
    showToast(`Вход через ${provider} будет доступен в следующей версии`, 'info')
  }

  // Восстановление пароля
  const handleForgotPassword = () => {
    showToast('Функция восстановления пароля будет доступна в следующей версии', 'info')
  }

  // Включение 2FA
  const handleEnable2FA = () => {
    showToast('Двухфакторная аутентификация будет доступна в следующей версии', 'info')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsFormDirty(true)

    try {
      console.log('Attempting to login...', { email, password: '***' });
      await login(email, password)
      console.log('Login successful, clearing saved data...');
      clearSavedData()
      showToast('Успешный вход в систему!', 'success')
      console.log('Toast shown, user should be redirected...');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Ошибка входа')
      showToast(err.message || 'Ошибка входа', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsFormDirty(true)

    try {
      await register(name, email, password)
      clearSavedData()
      showToast('Аккаунт успешно создан!', 'success')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
      showToast(err.message || 'Ошибка регистрации', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Обработка изменений в полях формы
  const handleInputChange = (field: 'email' | 'password' | 'name', value: string) => {
    if (field === 'email') {
      setEmail(value)
    } else if (field === 'password') {
      setPassword(value)
    } else if (field === 'name') {
      setName(value)
    }
    setIsFormDirty(true)
  }

  const features = [
    {
      icon: CheckSquare,
      title: 'Управление задачами',
      description: 'Создавайте, редактируйте и отслеживайте задачи с приоритетами и сроками выполнения'
    },
    {
      icon: BarChart3,
      title: 'Аналитика продуктивности',
      description: 'Детальная статистика выполнения задач, прогресса и индекса продуктивности'
    },
    {
      icon: Calendar,
      title: 'Календарное планирование',
      description: 'Визуальный календарь с индикаторами задач и планированием по датам'
    },
    {
      icon: Bell,
      title: 'Умные уведомления',
      description: 'Настраиваемые напоминания о задачах, дедлайнах и важных событиях'
    },
    {
      icon: Settings,
      title: 'Персонализация',
      description: 'Темы, настройки интерфейса, экспорт/импорт данных и многое другое'
    },
    {
      icon: Shield,
      title: 'Безопасность данных',
      description: 'Защищенное хранение данных с возможностью резервного копирования'
    },
    {
      icon: FileText,
      title: 'Экспорт и импорт',
      description: 'Экспорт задач в JSON, CSV, PDF, XLSX и импорт из различных форматов'
    },
    {
      icon: User,
      title: 'Профиль пользователя',
      description: 'Персональный профиль с аватаром, настройками и историей активности'
    },
    {
      icon: Globe,
      title: 'Кроссплатформенность',
      description: 'Работает на всех устройствах: веб, мобильные приложения, десктоп'
    }
  ]


  const teamMembers = [
    { name: 'Мырзат Нурислам', role: 'Основатель', avatar: '👨‍💻' },
    { name: 'Мырзат Нурислам', role: 'Сооснователь', avatar: '👨‍💼' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Анимированные частицы */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}

      {/* Навигационная панель */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">Serenity</span>
          </motion.div>

          {/* Десктопное меню */}
          <Navigation isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Переключатель темы */}
            <ThemeToggle isDark={isDarkTheme} onToggle={() => setIsDarkTheme(!isDarkTheme)} />
            
            {/* Языковой переключатель */}
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            
            {/* Кнопка демо-тура */}
            <motion.button
              onClick={() => setShowDemoTour(true)}
              className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
            </motion.button>

            <button 
              onClick={() => setShowRegister(false)}
              className="btn-ghost px-6 py-2"
            >
              Войти
            </button>
            <button 
              onClick={() => setShowRegister(true)}
              className="btn-primary px-6 py-2"
            >
              Регистрация
            </button>
          </motion.div>

          {/* Мобильное меню */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Главная секция */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Левая часть - Информация о продукте */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <motion.h1
                  className="text-6xl font-extrabold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Премиум
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Менеджер Задач
                  </span>
                </motion.h1>
                <motion.p
                  className="text-xl text-slate-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Революционный инструмент для управления задачами с искусственным интеллектом, 
                  красивым дизайном и мощными возможностями для повышения продуктивности.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <button 
                  onClick={() => setShowRegister(true)}
                  className="btn-primary px-8 py-4 text-lg shadow-glow"
                >
                  <Sparkles className="w-5 h-5 mr-2 inline" />
                  Начать бесплатно
                </button>
                <button className="btn-ghost px-8 py-4 text-lg">
                  <Target className="w-5 h-5 mr-2 inline" />
                  Смотреть демо
                </button>
              </motion.div>

              {/* Живые статистики */}
              <motion.div
                className="pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <LiveStats />
              </motion.div>
            </motion.div>

            {/* Правая часть - Форма входа/регистрации */}
            <motion.div
              id="auth-form"
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative max-w-md mx-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-large p-8">
                {/* Переключатель вкладок */}
                <div className="flex mb-8 bg-slate-700/50 rounded-2xl p-1">
                  <button
                    onClick={() => setShowRegister(false)}
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
                    onClick={() => setShowRegister(true)}
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

                {!showRegister ? (
                  <form ref={formRef} onSubmit={handleLogin} className="space-y-6">
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
                          onChange={(e) => handleInputChange('email', e.target.value)}
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
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
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
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span>Запомнить меня</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
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
                          onClick={() => handleSocialLogin('google')}
                          className="flex items-center justify-center space-x-2 py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Chrome className="w-4 h-4" />
                          <span className="text-xs">Google</span>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => handleSocialLogin('github')}
                          className="flex items-center justify-center space-x-2 py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github className="w-4 h-4" />
                          <span className="text-xs">GitHub</span>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => handleSocialLogin('apple')}
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
                        onClick={handleEnable2FA}
                        className="text-slate-400 hover:text-blue-400 text-sm transition-colors flex items-center justify-center space-x-1 mx-auto"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Включить двухфакторную аутентификацию</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-6">
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
                          onChange={(e) => handleInputChange('name', e.target.value)}
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
                          onChange={(e) => handleInputChange('email', e.target.value)}
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
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
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
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Секция возможностей */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Мощные возможности для вашей продуктивности
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Serenity объединяет в себе все необходимые инструменты для эффективного управления задачами
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>


      {/* Секция о нас */}
      <section id="about" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              О нашей команде
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Мы создаем инновационные решения для планирования задач и стремимся внедрить наше приложение в образовательную программу Казахстана
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamCard
                key={index}
                name={member.name}
                role={member.role}
                avatar={member.avatar}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Секция миссии */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Наша миссия
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Главная цель нашего проекта — помочь людям с планированием задач и повысить их продуктивность. 
              В будущем мы планируем внедрить наше приложение в образовательную программу Казахстана, 
              чтобы студенты и преподаватели могли эффективно организовывать учебный процесс.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-blue-500/30 backdrop-blur-xl shadow-glow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Повышение продуктивности</h3>
              <p className="text-slate-300">
                Помогаем людям эффективно планировать и выполнять задачи, повышая их личную продуктивность
              </p>
            </motion.div>

            <motion.div
              className="text-center p-8 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-3xl border border-green-500/30 backdrop-blur-xl shadow-glow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <GraduationCap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Образовательная интеграция</h3>
              <p className="text-slate-300">
                Планируем внедрение в образовательную программу Казахстана для улучшения учебного процесса
              </p>
            </motion.div>

            <motion.div
              className="text-center p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl border border-purple-500/30 backdrop-blur-xl shadow-glow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <Heart className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Инновации для всех</h3>
              <p className="text-slate-300">
                Создаем доступные и интуитивные инструменты для планирования, которые подходят каждому
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Секция поддержки */}
      <section id="support" className="py-24 relative z-10 bg-gradient-to-br from-slate-800/20 to-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Мы всегда готовы помочь
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Наша команда поддержки работает 24/7, чтобы обеспечить вам лучший опыт
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Email поддержка */}
            <motion.div
              className="text-center p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient overflow-hidden relative"
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -15, 
                scale: 1.05, 
                rotateY: 5,
                rotateX: -5,
                transition: { duration: 0.4, type: "spring", stiffness: 300 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Анимированный переливающийся фон */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"
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

              {/* Плавающие частицы */}
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      scale: [0.3, 1, 0.3],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </motion.div>

              <div className="relative z-10">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                    transition: { duration: 0.6, type: "spring", stiffness: 200 }
                  }}
                >
                  <Mail className="w-8 h-8 text-blue-400" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-white mb-4"
                  whileHover={{ 
                    scale: 1.05,
                    color: "#60a5fa",
                    transition: { duration: 0.3 }
                  }}
                >
                  Email поддержка
                </motion.h3>
                
                <motion.p 
                  className="text-slate-300 mb-4"
                  whileHover={{ 
                    color: "#cbd5e1",
                    transition: { duration: 0.3 }
                  }}
                >
                  Отвечаем в течение 2 часов
                </motion.p>
                
                <motion.p 
                  className="text-blue-400 font-medium"
                  whileHover={{ 
                    color: "#93c5fd",
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  support@serenity.com
                </motion.p>
              </div>

              {/* Анимированная рамка */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-transparent"
                whileHover={{
                  borderImage: "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1",
                  transition: { duration: 0.3 }
                }}
              />
            </motion.div>

            {/* Живой чат */}
            <motion.div
              className="text-center p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient overflow-hidden relative"
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -15, 
                scale: 1.05, 
                rotateY: 5,
                rotateX: -5,
                transition: { duration: 0.4, type: "spring", stiffness: 300 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Анимированный переливающийся фон */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))",
                    "linear-gradient(45deg, rgba(20, 184, 166, 0.1), rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))",
                    "linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1), rgba(34, 197, 94, 0.1))",
                    "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              {/* Плавающие частицы */}
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-green-400/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      scale: [0.3, 1, 0.3],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </motion.div>

              <div className="relative z-10">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                    transition: { duration: 0.6, type: "spring", stiffness: 200 }
                  }}
                >
                  <Clock className="w-8 h-8 text-green-400" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-white mb-4"
                  whileHover={{ 
                    scale: 1.05,
                    color: "#4ade80",
                    transition: { duration: 0.3 }
                  }}
                >
                  Живой чат
                </motion.h3>
                
                <motion.p 
                  className="text-slate-300 mb-4"
                  whileHover={{ 
                    color: "#cbd5e1",
                    transition: { duration: 0.3 }
                  }}
                >
                  Мгновенная помощь онлайн
                </motion.p>
                
                <motion.p 
                  className="text-green-400 font-medium"
                  whileHover={{ 
                    color: "#86efac",
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  Доступен 24/7
                </motion.p>
              </div>

              {/* Анимированная рамка */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-transparent"
                whileHover={{
                  borderImage: "linear-gradient(45deg, #22c55e, #10b981, #14b8a6) 1",
                  transition: { duration: 0.3 }
                }}
              />
            </motion.div>

            {/* Сообщество */}
            <motion.div
              className="text-center p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient overflow-hidden relative"
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -15, 
                scale: 1.05, 
                rotateY: 5,
                rotateX: -5,
                transition: { duration: 0.4, type: "spring", stiffness: 300 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Анимированный переливающийся фон */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1))",
                    "linear-gradient(45deg, rgba(244, 63, 94, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
                    "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1), rgba(147, 51, 234, 0.1))",
                    "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1))"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              {/* Плавающие частицы */}
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      scale: [0.3, 1, 0.3],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </motion.div>

              <div className="relative z-10">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 360,
                    boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)",
                    transition: { duration: 0.6, type: "spring", stiffness: 200 }
                  }}
                >
                  <Heart className="w-8 h-8 text-purple-400" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-white mb-4"
                  whileHover={{ 
                    scale: 1.05,
                    color: "#a855f7",
                    transition: { duration: 0.3 }
                  }}
                >
                  Сообщество
                </motion.h3>
                
                <motion.p 
                  className="text-slate-300 mb-4"
                  whileHover={{ 
                    color: "#cbd5e1",
                    transition: { duration: 0.3 }
                  }}
                >
                  Помощь от других пользователей
                </motion.p>
                
                <motion.p 
                  className="text-purple-400 font-medium"
                  whileHover={{ 
                    color: "#c084fc",
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  50K+ участников
                </motion.p>
              </div>

              {/* Анимированная рамка */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-transparent"
                whileHover={{
                  borderImage: "linear-gradient(45deg, #9333ea, #ec4899, #f43f5e) 1",
                  transition: { duration: 0.3 }
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="py-12 border-t border-slate-700/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">Serenity</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 Serenity. Все права защищены.
            </div>
          </div>
        </div>
      </footer>

      {/* Toast уведомления */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* Демо-тур */}
      <DemoTour
        isActive={showDemoTour}
        onClose={() => setShowDemoTour(false)}
      />
    </div>
  )
}
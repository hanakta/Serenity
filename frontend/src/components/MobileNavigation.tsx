'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Home, 
  CheckSquare, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  Bell, 
  Settings,
  Plus,
  Timer,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  User,
  LogOut,
  ChevronRight,
  Star
} from 'lucide-react'

interface MobileNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
  onCreateTask: () => void
  isOpen: boolean
  onToggle: () => void
  user?: any
  onLogout?: () => void
}

const MobileNavigation = memo(function MobileNavigation({
  currentView,
  onViewChange,
  onCreateTask,
  isOpen,
  onToggle,
  user,
  onLogout
}: MobileNavigationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Дашборд', 
      icon: Home, 
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      description: 'Обзор и статистика'
    },
    { 
      id: 'tasks', 
      label: 'Задачи', 
      icon: CheckSquare, 
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-emerald-500/20',
      description: 'Управление задачами'
    },
    { 
      id: 'focus', 
      label: 'Фокус', 
      icon: Timer, 
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-pink-500/20',
      description: 'Pomodoro таймер'
    },
    { 
      id: 'teams', 
      label: 'Команды', 
      icon: Users, 
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      description: 'Командная работа'
    },
    { 
      id: 'analytics', 
      label: 'Аналитика и статистика', 
      icon: BarChart3, 
      color: 'text-purple-400',
      gradient: 'from-purple-500/20 to-indigo-500/20',
      description: 'Отчеты, метрики и статистика'
    }
  ]

  const quickActions = [
    { 
      id: 'create-task', 
      label: 'Создать задачу', 
      icon: Plus, 
      action: onCreateTask,
      color: 'text-blue-400'
    },
    { 
      id: 'search', 
      label: 'Поиск', 
      icon: Search, 
      action: () => setSearchQuery(''),
      color: 'text-green-400'
    },
    { 
      id: 'pricing', 
      label: 'Привилегии', 
      icon: Star, 
      action: () => window.location.href = '/pricing',
      color: 'text-yellow-400'
    },
    { 
      id: 'settings', 
      label: 'Настройки', 
      icon: Settings, 
      action: () => onViewChange('settings'),
      color: 'text-purple-400'
    }
  ]

  const handleItemClick = useCallback((view: string) => {
    onViewChange(view)
    onToggle()
  }, [onViewChange, onToggle])

  if (!isVisible) return null

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onToggle}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 pt-20 border-b border-slate-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Serenity</h2>
                    <p className="text-xs text-slate-400">Менеджер задач</p>
                  </div>
                </div>

                {/* User Profile */}
                {user && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-300">Быстрые действия</h3>
                  <button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                
                <AnimatePresence>
                  {showQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-2"
                    >
                      {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                          <motion.button
                            key={action.id}
                            onClick={() => {
                              action.action()
                              onToggle()
                            }}
                            className="flex flex-col items-center space-y-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Icon className={`w-5 h-5 ${action.color}`} />
                            <span className="text-xs text-slate-300">{action.label}</span>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Items */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Навигация</h3>
                <nav className="space-y-2">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = currentView === item.id
                    
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white'
                            : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-400">{item.description}</div>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-blue-400" />
                        )}
                      </motion.button>
                    )
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700/50 mt-auto">
                {onLogout && (
                  <motion.button
                    onClick={() => {
                      onLogout()
                      onToggle()
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Выйти</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

export default MobileNavigation















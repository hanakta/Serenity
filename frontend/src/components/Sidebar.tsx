'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  Settings, 
  Bell, 
  User, 
  Plus,
  Search,
  Filter,
  Menu,
  X,
  Users,
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  Award,
  Timer
} from 'lucide-react'
import AvatarImage from './AvatarImage'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  onCreateTask: () => void
  user?: User
  onCollapseChange?: (isCollapsed: boolean) => void
}

const Sidebar = memo(function Sidebar({ currentView, onViewChange, onCreateTask, user, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Мемоизированные обработчики
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const handleViewChange = useCallback((view: string) => {
    onViewChange(view)
  }, [onViewChange])

  // Уведомляем родительский компонент об изменении состояния сворачивания
  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

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
      label: 'Мои команды', 
      icon: Users, 
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      description: 'Командная работа'
    },
    { 
      id: 'public-teams', 
      label: 'Публичные команды', 
      icon: Search, 
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-red-500/20',
      description: 'Найти команды'
    },
    { 
      id: 'collaboration', 
      label: 'Коллаборация', 
      icon: MessageSquare, 
      color: 'text-pink-400',
      gradient: 'from-pink-500/20 to-purple-500/20',
      description: 'Общение и файлы'
    },
    { 
      id: 'analytics', 
      label: 'Аналитика и статистика', 
      icon: BarChart3, 
      color: 'text-purple-400',
      gradient: 'from-purple-500/20 to-indigo-500/20',
      description: 'Отчеты, метрики и статистика'
    },
    { 
      id: 'calendar', 
      label: 'Календарь', 
      icon: Calendar, 
      color: 'text-orange-400',
      gradient: 'from-orange-500/20 to-red-500/20',
      description: 'Планирование времени'
    },
    { 
      id: 'notifications', 
      label: 'Уведомления', 
      icon: Bell, 
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-pink-500/20',
      description: 'Активность и события'
    },
    { 
      id: 'settings', 
      label: 'Настройки', 
      icon: Settings, 
      color: 'text-gray-400',
      gradient: 'from-gray-500/20 to-slate-500/20',
      description: 'Персонализация'
    },
  ]

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  }

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  }

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className="fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Serenity
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={handleToggleCollapse}
          className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-slate-400" />}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-700/50 space-y-3">
        <motion.button
          onClick={onCreateTask}
          className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 relative overflow-hidden group ${
            isCollapsed 
              ? 'p-2 flex items-center justify-center' 
              : 'p-3 flex items-center justify-center space-x-2'
          }`}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className={`relative z-10 flex items-center ${
            isCollapsed ? 'justify-center' : 'space-x-2'
          }`}>
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Plus className="w-5 h-5" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="font-medium"
                >
                  Создать задачу
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sparkle effect */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-3 h-3 text-yellow-300" />
          </div>
        </motion.button>
        
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`w-full flex items-center transition-all duration-300 group relative overflow-hidden ${
                isCollapsed 
                  ? 'justify-center p-2' 
                  : 'space-x-3 p-3 rounded-xl'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white hover:shadow-lg hover:shadow-slate-500/5'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
              
              <div className={`relative z-10 transition-all duration-300 ${
                isCollapsed 
                  ? 'p-1' 
                  : 'p-2 rounded-lg'
              } ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 shadow-lg shadow-blue-500/20' 
                  : isCollapsed 
                    ? '' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
              }`}>
                <Icon className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-blue-400' : `${item.color} group-hover:scale-110`
                }`} />
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    variants={itemVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex-1 text-left relative z-10"
                  >
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
                      {item.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-l-full"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50">
        <div className={`flex items-center p-3 rounded-xl bg-slate-800/50 ${
          isCollapsed ? 'justify-center' : 'space-x-3'
        }`}>
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <AvatarImage 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Пользователь'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'email@example.com'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
})

export default Sidebar


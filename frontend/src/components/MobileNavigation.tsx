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
  Plus
} from 'lucide-react'

interface MobileNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
  onCreateTask: () => void
  isOpen: boolean
  onToggle: () => void
}

const MobileNavigation = memo(function MobileNavigation({
  currentView,
  onViewChange,
  onCreateTask,
  isOpen,
  onToggle
}: MobileNavigationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: Home },
    { id: 'tasks', label: 'Задачи', icon: CheckSquare },
    { id: 'teams', label: 'Команды', icon: Users },
    { id: 'collaboration', label: 'Коллаборация', icon: MessageSquare },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'settings', label: 'Настройки', icon: Settings }
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
              className="fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 shadow-2xl"
            >
              <div className="p-6 pt-20">
                {/* Create Task Button */}
                <motion.button
                  onClick={() => {
                    onCreateTask()
                    onToggle()
                  }}
                  className="w-full mb-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl p-4 flex items-center justify-center space-x-3 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Создать задачу</span>
                </motion.button>

                {/* Navigation Items */}
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
                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-blue-600/20' : 'bg-slate-700/50'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isActive ? 'text-blue-400' : 'text-slate-400'
                          }`} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

export default MobileNavigation








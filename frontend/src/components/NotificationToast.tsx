'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Bell,
  Star,
  Zap,
  Heart
} from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

interface NotificationToastProps {
  notification: Notification
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const NotificationToast = memo(function NotificationToast({
  notification,
  onRemove,
  position = 'top-right'
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onRemove])

  const getIcon = () => {
    if (notification.icon) return notification.icon

    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      case 'achievement':
        return <Star className="w-5 h-5 text-purple-400" />
      default:
        return <Bell className="w-5 h-5 text-slate-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'error':
        return 'bg-red-500/10 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30'
      case 'achievement':
        return 'bg-purple-500/10 border-purple-500/30'
      default:
        return 'bg-slate-500/10 border-slate-500/30'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full`}
        >
          <div className={`relative p-4 rounded-xl border backdrop-blur-xl shadow-lg ${getBackgroundColor()}`}>
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl" />
            
            <div className="relative z-10">
              <div className="flex items-start space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="flex-shrink-0"
                >
                  {getIcon()}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h4
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-semibold text-white mb-1"
                  >
                    {notification.title}
                  </motion.h4>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-slate-300 leading-relaxed"
                  >
                    {notification.message}
                  </motion.p>
                  
                  {notification.action && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={notification.action.onClick}
                      className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {notification.action.label}
                    </motion.button>
                  )}
                </div>
                
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => onRemove(notification.id), 300)
                  }}
                  className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </motion.button>
              </div>
            </div>
            
            {/* Progress bar */}
            {notification.duration && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-b-xl"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: notification.duration / 1000, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default NotificationToast








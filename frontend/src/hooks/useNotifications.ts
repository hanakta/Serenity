import { useState, useCallback, useRef } from 'react'
import { Notification } from '@/components/NotificationToast'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const idCounter = useRef(0)

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${++idCounter.current}`
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 7000, // Longer duration for errors
      ...options
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }, [addNotification])

  const showAchievement = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'achievement',
      title,
      message,
      duration: 8000, // Longer duration for achievements
      ...options
    })
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement
  }
}








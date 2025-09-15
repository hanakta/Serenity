'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  X, 
  Settings, 
  Trash2,
  Filter,
  Search
} from 'lucide-react'
import { Task, formatDateTime } from '@/lib/utils'
import { useTasks } from '@/hooks/useTasks'

interface Notification {
  id: string
  type: 'task_due' | 'task_overdue' | 'task_completed' | 'reminder' | 'achievement'
  title: string
  message: string
  task?: Task
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface NotificationsViewProps {
  onCreateTask: () => void
}

export default function NotificationsView({ onCreateTask }: NotificationsViewProps) {
  const { tasks, loading } = useTasks()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'urgent'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Генерируем уведомления на основе задач
  useEffect(() => {
    if (!tasks) return

    const newNotifications: Notification[] = []

    tasks.forEach(task => {
      const now = new Date()
      const dueDate = task.due_date ? new Date(task.due_date) : null

      // Уведомления о просроченных задачах
      if (dueDate && dueDate < now && task.status !== 'completed') {
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        
        newNotifications.push({
          id: `overdue_${task.id}`,
          type: 'task_overdue',
          title: 'Задача просрочена',
          message: `Задача "${task.title}" просрочена на ${daysOverdue} дн.`,
          task,
          timestamp: dueDate,
          read: false,
          priority: daysOverdue > 3 ? 'urgent' : 'high'
        })
      }

      // Уведомления о задачах на сегодня
      if (dueDate && dueDate.toDateString() === now.toDateString() && task.status !== 'completed') {
        newNotifications.push({
          id: `due_today_${task.id}`,
          type: 'task_due',
          title: 'Задача на сегодня',
          message: `Задача "${task.title}" должна быть выполнена сегодня`,
          task,
          timestamp: now,
          read: false,
          priority: 'medium'
        })
      }

      // Уведомления о выполненных задачах
      if (task.status === 'completed') {
        newNotifications.push({
          id: `completed_${task.id}`,
          type: 'task_completed',
          title: 'Задача выполнена',
          message: `Поздравляем! Задача "${task.title}" выполнена`,
          task,
          timestamp: new Date(task.updated_at || task.created_at),
          read: false,
          priority: 'low'
        })
      }
    })

    // Добавляем демо уведомления
    newNotifications.push(
      {
        id: 'demo_1',
        type: 'achievement',
        title: 'Достижение разблокировано!',
        message: 'Вы выполнили 5 задач подряд. Отличная работа!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
        read: false,
        priority: 'medium'
      },
      {
        id: 'demo_2',
        type: 'reminder',
        title: 'Напоминание',
        message: 'Не забудьте проверить задачи на завтра',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
        read: true,
        priority: 'low'
      }
    )

    // Сортируем по приоритету и времени
    newNotifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    setNotifications(newNotifications)
  }, [tasks])

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'high' && notification.priority === 'high') ||
      (filter === 'urgent' && notification.priority === 'urgent')
    
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_overdue':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'task_due':
        return <Clock className="w-5 h-5 text-orange-400" />
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'achievement':
        return <Bell className="w-5 h-5 text-yellow-400" />
      case 'reminder':
        return <Bell className="w-5 h-5 text-blue-400" />
      default:
        return <Bell className="w-5 h-5 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500/50 bg-red-500/10'
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10'
      case 'medium':
        return 'border-blue-500/50 bg-blue-500/10'
      case 'low':
        return 'border-slate-500/50 bg-slate-500/10'
      default:
        return 'border-slate-500/50 bg-slate-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center">
            <Bell className="w-8 h-8 mr-3 text-blue-400" />
            Уведомления
          </h2>
          <p className="text-slate-400">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все уведомления прочитаны'}
            {urgentCount > 0 && (
              <span className="ml-2 text-red-400">
                • {urgentCount} срочных
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-colors"
            >
              Отметить все как прочитанные
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск уведомлений..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        
        <div className="flex space-x-2">
          {(['all', 'unread', 'high', 'urgent'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-3 rounded-xl transition-colors ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {filterType === 'all' && 'Все'}
              {filterType === 'unread' && 'Непрочитанные'}
              {filterType === 'high' && 'Важные'}
              {filterType === 'urgent' && 'Срочные'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300
                  ${getPriorityColor(notification.priority)}
                  ${!notification.read ? 'ring-2 ring-blue-500/30' : ''}
                  hover:scale-[1.02] shadow-hover
                `}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${
                        !notification.read ? 'text-white' : 'text-slate-300'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>
                          {formatDateTime(notification.timestamp)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          notification.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {notification.priority === 'urgent' ? 'Срочно' :
                           notification.priority === 'high' ? 'Важно' :
                           notification.priority === 'medium' ? 'Средне' : 'Низко'}
                        </span>
                      </div>
                      
                      {notification.task && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Здесь можно добавить логику для перехода к задаче
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          Посмотреть задачу
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'Уведомления не найдены' : 'Нет уведомлений'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Здесь будут появляться уведомления о ваших задачах'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={onCreateTask}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Создать первую задачу
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

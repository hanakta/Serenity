'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar as CalendarIcon,
  Target,
  Zap,
  Star,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react'
import { Task, formatDate, isOverdue, isDueToday } from '@/lib/utils'
import { useTasks } from '@/hooks/useTasks'

interface CalendarViewProps {
  onCreateTask: () => void
}

export default function CalendarView({ onCreateTask }: CalendarViewProps) {
  const { tasks, loading } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const getDaysInMonth = () => {
    const days = []
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getTasksForDate = (date: Date) => {
    if (!tasks) return []
    
    return tasks.filter(task => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const getTasksForToday = () => {
    if (!tasks) return []
    return tasks.filter(task => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return taskDate.toDateString() === today.toDateString()
    })
  }

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return []
    return getTasksForDate(selectedDate)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'in_progress': return <Clock className="w-3 h-3 text-orange-400" />
      case 'cancelled': return <AlertTriangle className="w-3 h-3 text-red-400" />
      default: return <Target className="w-3 h-3 text-blue-400" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Заголовок с анимацией загрузки */}
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700/50 rounded-lg w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-slate-700/30 rounded w-32 mx-auto"></div>
          </div>
        </div>
        
        {/* Календарь с анимацией загрузки */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-700/50 rounded w-32 mx-auto mb-6"></div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-700/30 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-700/30 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Заголовок с анимированным фоном */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <CalendarIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Календарь
          </h1>
          <p className="text-slate-300 text-lg">Планирование времени и управление задачами</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Календарь */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-soft"
          >
            {/* Навигация по месяцам */}
            <div className="flex items-center justify-between mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth('prev')}
                className="p-3 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300 border border-slate-600/50"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </motion.button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {monthNames[month]} {year}
                </h2>
                <p className="text-slate-400 text-sm">Планируйте свои задачи</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth('next')}
                className="p-3 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300 border border-slate-600/50"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </motion.button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map((day, index) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center text-slate-400 font-semibold py-3 text-sm"
                >
                  {day}
                </motion.div>
              ))}
            </div>

            {/* Сетка календаря */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-24" />
                }

                const dayTasks = getTasksForDate(date)
                const isCurrentDay = isToday(date)
                const isSelectedDay = isSelected(date)
                const hasTasks = dayTasks.length > 0

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.02 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative h-24 rounded-xl transition-all duration-300 group
                      ${isCurrentDay 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-glow' 
                        : isSelectedDay
                        ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white border-2 border-blue-400'
                        : 'bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 hover:text-white'
                      }
                    `}
                  >
                    <div className="p-2 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${isCurrentDay ? 'text-white' : 'text-slate-300'}`}>
                          {date.getDate()}
                        </span>
                        {hasTasks && (
                          <div className="flex space-x-1">
                            {dayTasks.slice(0, 2).map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className={`w-2 h-2 rounded-full ${getTaskPriorityColor(task.priority)}`}
                              />
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="w-2 h-2 rounded-full bg-slate-500" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {hasTasks && (
                        <div className="flex-1 flex flex-col justify-end">
                          <div className="text-xs text-slate-400 group-hover:text-slate-300">
                            {dayTasks.length} {dayTasks.length === 1 ? 'задача' : 'задач'}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Задачи на сегодня */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-soft"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg mr-3">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Задачи на сегодня</h3>
            </div>
            
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{getTasksForToday().length}</div>
              <p className="text-slate-400 text-sm">
                {getTasksForToday().length === 0 ? 'Нет задач на сегодня' : 'Задач запланировано'}
              </p>
            </div>
          </motion.div>

          {/* Быстрые действия */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-soft"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg mr-3">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Быстрые действия</h3>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateTask}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-soft"
              >
                <Plus className="w-4 h-4" />
                <span>Создать задачу</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDate(today)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-soft"
              >
                <Target className="w-4 h-4" />
                <span>Сегодня</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Статистика месяца */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-soft"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg mr-3">
                <Star className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Статистика месяца</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Всего задач</span>
                <span className="text-white font-semibold">
                  {tasks?.filter(task => {
                    if (!task.due_date) return false
                    const taskDate = new Date(task.due_date)
                    return taskDate.getMonth() === month && taskDate.getFullYear() === year
                  }).length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Выполнено</span>
                <span className="text-green-400 font-semibold">
                  {tasks?.filter(task => {
                    if (!task.due_date || task.status !== 'completed') return false
                    const taskDate = new Date(task.due_date)
                    return taskDate.getMonth() === month && taskDate.getFullYear() === year
                  }).length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">В работе</span>
                <span className="text-orange-400 font-semibold">
                  {tasks?.filter(task => {
                    if (!task.due_date || task.status !== 'in_progress') return false
                    const taskDate = new Date(task.due_date)
                    return taskDate.getMonth() === month && taskDate.getFullYear() === year
                  }).length || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Детали выбранной даты */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedDate.toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {getTasksForSelectedDate().length} {getTasksForSelectedDate().length === 1 ? 'задача' : 'задач'}
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(null)}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </motion.button>
            </div>

            {getTasksForSelectedDate().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTasksForSelectedDate().map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-700/30 hover:bg-slate-600/50 rounded-xl p-4 transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTaskStatusIcon(task.status)}
                        <span className="text-sm font-medium text-slate-300 capitalize">
                          {task.status}
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getTaskPriorityColor(task.priority)}`} />
                    </div>
                    
                    <h4 className="text-white font-semibold mb-2 line-clamp-2">{task.title}</h4>
                    
                    {task.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="capitalize">{task.category}</span>
                      <span className="capitalize">{task.priority}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Нет задач на эту дату</h4>
                <p className="text-slate-400 mb-4">Создайте задачу, чтобы спланировать этот день</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCreateTask}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-all duration-300"
                >
                  Создать задачу
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
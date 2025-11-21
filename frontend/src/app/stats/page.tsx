'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { usePomodoro } from '@/hooks/usePomodoro'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Activity,
  Zap,
  Timer,
  Coffee,
  Brain,
  Star
} from 'lucide-react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Регистрируем компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend)
import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import PremiumUserProfile from '@/components/PremiumUserProfile'
import PremiumSettingsButton from '@/components/PremiumSettingsButton'

export default function StatsPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'lifetime'>('lifetime')

  const {
    sessions,
    stats,
    lifetimeStats,
    weeklyStats,
    monthlyStats,
    dailyActivity,
    topTasks,
    loading: pomodoroLoading,
    error: pomodoroError,
    loadAllData,
    fetchLifetimeStats,
    fetchWeeklyStats,
    fetchMonthlyStats
  } = usePomodoro()

  useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.push('/login')
    }
  }, [isClient, user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user, loadAllData])

  const handlePeriodChange = async (period: 'week' | 'month' | 'lifetime') => {
    setSelectedPeriod(period)
    
    switch (period) {
      case 'lifetime':
        await fetchLifetimeStats()
        break
      case 'week':
        await fetchWeeklyStats(12)
        break
      case 'month':
        await fetchMonthlyStats(12)
        break
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentStats = selectedPeriod === 'lifetime' ? lifetimeStats : 
                      selectedPeriod === 'week' ? { data: weeklyStats } : 
                      { data: monthlyStats }

  // Данные для графика распределения времени по задачам
  const getTimeDistributionData = () => {
    if (!lifetimeStats || !topTasks || topTasks.length === 0) return null

    // Цвета для задач (генерируем разные цвета)
    const taskColors = [
      'rgba(59, 130, 246, 0.8)',   // синий
      'rgba(34, 197, 94, 0.8)',    // зеленый
      'rgba(147, 51, 234, 0.8)',   // фиолетовый
      'rgba(239, 68, 68, 0.8)',    // красный
      'rgba(245, 158, 11, 0.8)',   // желтый
      'rgba(236, 72, 153, 0.8)',   // розовый
      'rgba(14, 165, 233, 0.8)',   // голубой
      'rgba(34, 197, 94, 0.8)',    // лайм
      'rgba(168, 85, 247, 0.8)',   // индиго
      'rgba(251, 146, 60, 0.8)'    // оранжевый
    ]

    const borderColors = [
      'rgba(59, 130, 246, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(147, 51, 234, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(14, 165, 233, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(251, 146, 60, 1)'
    ]

    const hoverColors = [
      'rgba(59, 130, 246, 0.9)',
      'rgba(34, 197, 94, 0.9)',
      'rgba(147, 51, 234, 0.9)',
      'rgba(239, 68, 68, 0.9)',
      'rgba(245, 158, 11, 0.9)',
      'rgba(236, 72, 153, 0.9)',
      'rgba(14, 165, 233, 0.9)',
      'rgba(34, 197, 94, 0.9)',
      'rgba(168, 85, 247, 0.9)',
      'rgba(251, 146, 60, 0.9)'
    ]

    // Берем топ-7 задач по времени
    const topTasksData = topTasks.slice(0, 7)
    
    // Подготавливаем данные для задач
    const taskLabels = topTasksData.map(task => 
      task.task_title.length > 20 
        ? task.task_title.substring(0, 20) + '...' 
        : task.task_title
    )
    const taskData = topTasksData.map(task => task.total_duration)

    // Добавляем перерывы
    const shortBreakTime = lifetimeStats.short_break_sessions * 5 // 5 минут на короткий перерыв
    const longBreakTime = lifetimeStats.long_break_sessions * 15 // 15 минут на длинный перерыв

    // Если есть время на перерывы, добавляем их
    const labels = [...taskLabels]
    const data = [...taskData]
    const backgroundColor = [...taskColors.slice(0, topTasksData.length)]
    const borderColor = [...borderColors.slice(0, topTasksData.length)]
    const hoverBackgroundColor = [...hoverColors.slice(0, topTasksData.length)]

    if (shortBreakTime > 0) {
      labels.push('Короткие перерывы')
      data.push(shortBreakTime)
      backgroundColor.push('rgba(156, 163, 175, 0.8)') // серый для перерывов
      borderColor.push('rgba(156, 163, 175, 1)')
      hoverBackgroundColor.push('rgba(156, 163, 175, 0.9)')
    }

    if (longBreakTime > 0) {
      labels.push('Длинные перерывы')
      data.push(longBreakTime)
      backgroundColor.push('rgba(107, 114, 128, 0.8)') // темно-серый для длинных перерывов
      borderColor.push('rgba(107, 114, 128, 1)')
      hoverBackgroundColor.push('rgba(107, 114, 128, 0.9)')
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor,
          borderWidth: 2,
          hoverBackgroundColor
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${formatTime(value)} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Navigation */}
      <MobileNavigation
        currentView="analytics"
        onViewChange={(view) => {
          if (view === 'analytics') {
            // Остаемся на текущей странице
            return
          } else if (view === 'focus') {
            router.push('/focus')
          } else if (view === 'collaboration') {
            router.push('/collaboration')
          } else {
            // Для всех остальных вкладок переходим на главную страницу
            router.push(`/?view=${view}`)
          }
        }}
        onCreateTask={() => {}}
        isOpen={false}
        onToggle={() => {}}
      />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          currentView="analytics"
          onViewChange={(view) => {
            if (view === 'analytics') {
              // Остаемся на текущей странице
              return
            } else if (view === 'focus') {
              router.push('/focus')
            } else if (view === 'collaboration') {
              router.push('/collaboration')
            } else {
              // Для всех остальных вкладок переходим на главную страницу
              router.push(`/?view=${view}`)
            }
          }}
          onCreateTask={() => {}}
          user={user}
          onCollapseChange={setIsSidebarCollapsed}
        />
      )}

      {/* Main Content */}
      <motion.div 
        className="min-h-screen"
        animate={{ 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px')
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
      >
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Статистика Pomodoro</h1>
                <p className="text-slate-400">Анализ вашей продуктивности</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <PremiumSettingsButton onClick={() => router.push('/')} isActive={false} />
              <PremiumUserProfile user={user} onLogout={logout} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Period Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Период анализа</h2>
            <div className="flex space-x-2">
              {[
                { key: 'lifetime', label: 'За все время', icon: Award },
                { key: 'week', label: 'По неделям', icon: Calendar },
                { key: 'month', label: 'По месяцам', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handlePeriodChange(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    selectedPeriod === key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Cards */}
          {selectedPeriod === 'lifetime' && lifetimeStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{lifetimeStats.total_sessions}</span>
                </div>
                <h3 className="text-slate-300 font-medium">Всего сессий</h3>
                <p className="text-slate-400 text-sm mt-1">За все время</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{lifetimeStats.focus_sessions}</span>
                </div>
                <h3 className="text-slate-300 font-medium">Сессий фокуса</h3>
                <p className="text-slate-400 text-sm mt-1">Продуктивная работа</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{formatTime(lifetimeStats.total_focus_time)}</span>
                </div>
                <h3 className="text-slate-300 font-medium">Время фокуса</h3>
                <p className="text-slate-400 text-sm mt-1">Общее время</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{lifetimeStats.active_days}</span>
                </div>
                <h3 className="text-slate-300 font-medium">Активных дней</h3>
                <p className="text-slate-400 text-sm mt-1">Дней с сессиями</p>
              </div>
            </motion.div>
          )}

          {/* Detailed Stats */}
          {selectedPeriod === 'lifetime' && lifetimeStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Session Types */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Типы сессий</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-300">Фокус</span>
                    </div>
                    <span className="text-white font-semibold">{lifetimeStats.focus_sessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-300">Короткий перерыв</span>
                    </div>
                    <span className="text-white font-semibold">{lifetimeStats.short_break_sessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-slate-300">Длинный перерыв</span>
                    </div>
                    <span className="text-white font-semibold">{lifetimeStats.long_break_sessions}</span>
                  </div>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Анализ времени</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Средняя длительность фокуса</span>
                    <span className="text-white font-semibold">{lifetimeStats.avg_focus_duration} мин</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Общее время фокуса</span>
                    <span className="text-white font-semibold">{lifetimeStats.total_focus_hours} ч</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Завершенных сессий</span>
                    <span className="text-white font-semibold">{lifetimeStats.completed_sessions}</span>
                  </div>
                </div>
              </div>

              {/* Time Distribution Chart */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Время по задачам</h3>
                <div className="h-64">
                  {getTimeDistributionData() ? (
                    <Pie 
                      data={getTimeDistributionData()!} 
                      options={chartOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <BarChart3 className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-sm">Нет данных о задачах</p>
                        <p className="text-slate-500 text-xs mt-1">Создайте сессии фокуса для отображения статистики</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Tasks */}
          {topTasks && topTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Топ задач по времени фокуса</h3>
              <div className="space-y-3">
                {topTasks.slice(0, 5).map((task, index) => (
                  <div key={task.task_id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{task.task_title}</p>
                        <p className="text-slate-400 text-sm">{task.sessions_count} сессий</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatTime(task.total_duration)}</p>
                      <p className="text-slate-400 text-sm">среднее: {task.avg_duration}м</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Data State */}
          {!lifetimeStats && !pomodoroLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-slate-700/50">
                <BarChart3 className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Нет данных для анализа</h3>
              <p className="text-slate-400 mb-8 text-lg">Начните использовать Pomodoro таймер, чтобы увидеть статистику</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/focus')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300"
              >
                <Timer className="w-5 h-5 mr-2 inline" />
                Перейти к таймеру
              </motion.button>
            </motion.div>
          )}

          {/* Loading State */}
          {pomodoroLoading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Загрузка статистики...</p>
            </div>
          )}

          {/* Error State */}
          {pomodoroError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold">Ошибка загрузки</h3>
                  <p className="text-slate-400 text-sm">{pomodoroError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

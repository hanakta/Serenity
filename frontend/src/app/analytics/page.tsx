'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { usePomodoro } from '@/hooks/usePomodoro'
import { useTasks } from '@/hooks/useTasks'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Activity,
  Timer,
  Coffee,
  Brain,
  Star,
  CheckCircle,
  AlertTriangle,
  Users,
  Zap,
  PieChart,
  LineChart,
  BarChart
} from 'lucide-react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'

// Регистрируем компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import PremiumUserProfile from '@/components/PremiumUserProfile'
import PremiumSettingsButton from '@/components/PremiumSettingsButton'
import TaskStats from '@/components/TaskStats'

export default function AnalyticsPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'lifetime'>('lifetime')
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'pomodoro' | 'productivity'>('overview')

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

  const {
    tasks,
    stats: taskStats,
    loading: tasksLoading,
    error: tasksError,
    fetchTasks,
    fetchStats
  } = useTasks()

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
      fetchTasks()
      fetchStats()
    }
  }, [user, loadAllData, fetchTasks, fetchStats])

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

  const currentStats = selectedPeriod === 'lifetime' ? lifetimeStats : 
                      selectedPeriod === 'week' ? weeklyStats : monthlyStats

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3, color: 'text-blue-400' },
    { id: 'tasks', label: 'Задачи', icon: CheckCircle, color: 'text-green-400' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer, color: 'text-red-400' },
    { id: 'productivity', label: 'Продуктивность', icon: TrendingUp, color: 'text-purple-400' }
  ]

  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Navigation */}
      <MobileNavigation
        currentView="analytics"
        onViewChange={(view) => {
          if (view === 'analytics') {
            return
          } else if (view === 'focus') {
            router.push('/focus')
          } else if (view === 'collaboration') {
            router.push('/collaboration')
          } else {
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
              return
            } else if (view === 'focus') {
              router.push('/focus')
            } else if (view === 'collaboration') {
              router.push('/collaboration')
            } else {
              router.push(`/?view=${view}`)
            }
          }}
          onCreateTask={() => {}}
          user={user || undefined}
          onCollapseChange={setIsSidebarCollapsed}
        />
      )}

      {/* Main Content */}
      <motion.div 
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className={`flex items-center justify-between ${
              isMobile ? 'flex-col space-y-4' : 'flex-row'
            }`}>
              <div className={isMobile ? 'text-center' : ''}>
                <h1 className={`font-bold text-white mb-2 ${
                  isMobile ? 'text-2xl' : 'text-3xl'
                }`}>
                  Аналитика и статистика
                </h1>
                <p className={`text-slate-400 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Отчеты, метрики и статистика продуктивности
                </p>
              </div>
              
              <div className={`flex items-center space-x-4 ${
                isMobile ? 'flex-col space-y-3' : 'flex-row'
              }`}>
                {/* Period Selector */}
                <div className={`flex bg-slate-700/50 rounded-lg p-1 ${
                  isMobile ? 'w-full justify-center' : ''
                }`}>
                  {[
                    { id: 'week', label: 'Неделя' },
                    { id: 'month', label: 'Месяц' },
                    { id: 'lifetime', label: 'Все время' }
                  ].map((period) => (
                    <button
                      key={period.id}
                      onClick={() => handlePeriodChange(period.id as any)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isMobile ? 'px-2 text-xs' : 'px-4'
                      } ${
                        selectedPeriod === period.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <PremiumSettingsButton 
                    onClick={() => router.push('/')}
                    isActive={false}
                  />
                  
                   <PremiumUserProfile 
                     user={user!}
                    onLogout={logout}
                    onEdit={() => router.push('/')}
                    isActive={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
          isMobile ? 'px-4' : 'px-6'
        }`}>
          {/* Tabs */}
          <div className={`flex space-x-1 mb-8 ${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
            {tabs.map(({ id, label, icon: Icon, color }) => (
              <motion.button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isMobile ? 'text-sm' : 'px-6'
                } ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-4 h-4 ${color} ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span className="font-medium">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className={`grid gap-6 ${
                    isMobile 
                      ? 'grid-cols-1' 
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                  }`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-6 border border-blue-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-300 text-sm font-medium">Всего задач</p>
                          <p className="text-3xl font-bold text-white">{taskStats?.total_tasks || 0}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-6 border border-green-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-300 text-sm font-medium">Выполнено</p>
                          <p className="text-3xl font-bold text-white">{taskStats?.completed_tasks || 0}</p>
                        </div>
                        <Target className="w-8 h-8 text-green-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 border border-purple-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-sm font-medium">Pomodoro сессий</p>
                          <p className="text-3xl font-bold text-white">{(currentStats as any)?.total_sessions || 0}</p>
                        </div>
                        <Timer className="w-8 h-8 text-purple-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-6 border border-orange-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-300 text-sm font-medium">Время фокуса</p>
                          <p className="text-3xl font-bold text-white">{formatTime((currentStats as any)?.total_focus_time || 0)}</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Task Completion Chart */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <BarChart className="w-5 h-5 mr-2 text-blue-400" />
                        Статистика задач
                      </h3>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-400">График статистики задач</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Productivity Trend */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <LineChart className="w-5 h-5 mr-2 text-green-400" />
                        Тренд продуктивности
                      </h3>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-400">График тренда продуктивности</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-8">
                  <TaskStats stats={taskStats} loading={tasksLoading} />
                </div>
              )}

              {activeTab === 'pomodoro' && (
                <div className="space-y-8">
                  {/* Pomodoro Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl p-6 border border-red-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-300 text-sm font-medium">Сессий сегодня</p>
                          <p className="text-3xl font-bold text-white">{(currentStats as any)?.today_sessions || 0}</p>
                        </div>
                        <Timer className="w-8 h-8 text-red-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-6 border border-orange-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-300 text-sm font-medium">Средняя сессия</p>
                          <p className="text-3xl font-bold text-white">{formatTime((currentStats as any)?.avg_session_duration || 0)}</p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 border border-purple-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-sm font-medium">Лучшая серия</p>
                          <p className="text-3xl font-bold text-white">{(currentStats as any)?.best_streak || 0}</p>
                        </div>
                        <Award className="w-8 h-8 text-purple-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Top Tasks */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      Топ задач по времени фокуса
                    </h3>
                    <div className="space-y-3">
                      {topTasks?.slice(0, 5).map((task: any, index: number) => (
                        <div key={task.task_id || index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-400 text-sm">#{index + 1}</span>
                            <span className="text-white">{task.task_title}</span>
                          </div>
                          <span className="text-blue-400 font-medium">{formatTime(task.total_duration || 0)}</span>
                        </div>
                      )) || (
                        <p className="text-slate-400 text-center py-8">Нет данных о задачах</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === 'productivity' && (
                <div className="space-y-8">
                  {/* Productivity Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl p-6 border border-emerald-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-300 text-sm font-medium">Эффективность</p>
                          <p className="text-3xl font-bold text-white">85%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-2xl p-6 border border-cyan-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cyan-300 text-sm font-medium">Концентрация</p>
                          <p className="text-3xl font-bold text-white">92%</p>
                        </div>
                        <Brain className="w-8 h-8 text-cyan-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl p-6 border border-pink-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pink-300 text-sm font-medium">Мотивация</p>
                          <p className="text-3xl font-bold text-white">78%</p>
                        </div>
                        <Zap className="w-8 h-8 text-pink-400" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-2xl p-6 border border-indigo-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-300 text-sm font-medium">Баланс</p>
                          <p className="text-3xl font-bold text-white">88%</p>
                        </div>
                        <Activity className="w-8 h-8 text-indigo-400" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Productivity Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <BarChart className="w-5 h-5 mr-2 text-purple-400" />
                      Индекс продуктивности
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">График индекса продуктивности</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Activity,
  Zap,
  Timer,
  Brain,
  Star,
  ArrowRight
} from 'lucide-react'
import { usePomodoro } from '@/hooks/usePomodoro'
import { useRouter } from 'next/navigation'

interface PomodoroStatsProps {
  className?: string
}

export default function PomodoroStats({ className = '' }: PomodoroStatsProps) {
  const router = useRouter()
  const { lifetimeStats, loading, error } = usePomodoro()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Статистика Pomodoro</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Статистика Pomodoro</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-slate-400 mb-4">Ошибка загрузки статистики</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!lifetimeStats || lifetimeStats.total_sessions === 0) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Статистика Pomodoro</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/stats')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Начните использовать Pomodoro</h4>
          <p className="text-slate-400 text-sm mb-4">Создайте первую сессию, чтобы увидеть статистику</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/focus')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
          >
            Перейти к таймеру
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Статистика Pomodoro</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/stats')}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 text-sm">Сессий</span>
          </div>
          <p className="text-2xl font-bold text-white">{lifetimeStats.total_sessions}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 text-sm">Фокус</span>
          </div>
          <p className="text-2xl font-bold text-white">{lifetimeStats.focus_sessions}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 text-sm">Время</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(lifetimeStats.total_focus_time)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-4 border border-orange-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-orange-400" />
            <span className="text-slate-300 text-sm">Дней</span>
          </div>
          <p className="text-2xl font-bold text-white">{lifetimeStats.active_days}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm">Продуктивность</span>
          <span className="text-white font-semibold text-sm">
            {lifetimeStats.total_sessions > 0 ? Math.round((lifetimeStats.focus_sessions / lifetimeStats.total_sessions) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: lifetimeStats.total_sessions > 0 ? `${(lifetimeStats.focus_sessions / lifetimeStats.total_sessions) * 100}%` : '0%' 
            }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/focus')}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
        >
          <Timer className="w-4 h-4 mr-2 inline" />
          Таймер
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/stats')}
          className="flex-1 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <BarChart3 className="w-4 h-4 mr-2 inline" />
          Подробнее
        </motion.button>
      </div>
    </motion.div>
  )
}

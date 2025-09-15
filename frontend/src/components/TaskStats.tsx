'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TaskStats as TaskStatsType } from '@/lib/utils'
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Target,
  Zap,
  Award,
  Activity,
  PieChart,
  LineChart,
  Plus
} from 'lucide-react'

interface TaskStatsProps {
  stats?: TaskStatsType | null
  loading?: boolean
}

export default function TaskStats({ stats, loading = false }: TaskStatsProps) {
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
        
        {/* Карточки статистики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-slate-700/50"
        >
          <BarChart3 className="w-16 h-16 text-slate-400" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-4">Нет данных для анализа</h3>
        <p className="text-slate-400 mb-8 text-lg">Создайте первую задачу, чтобы увидеть подробную статистику</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2 inline" />
          Создать задачу
        </motion.button>
      </div>
    )
  }

  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
    : 0

  const urgentRate = stats.total_tasks > 0 
    ? Math.round((stats.urgent_tasks / stats.total_tasks) * 100) 
    : 0

  const overdueRate = stats.total_tasks > 0 
    ? Math.round((stats.overdue_tasks / stats.total_tasks) * 100) 
    : 0

  const productivityScore = Math.round(
    (completionRate * 0.4) + 
    ((100 - overdueRate) * 0.3) + 
    ((100 - urgentRate) * 0.3)
  )

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
            <BarChart3 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Аналитика
          </h1>
          <p className="text-slate-300 text-lg">Статистика и отчеты по вашей продуктивности</p>
        </div>
      </motion.div>

      {/* Основная статистика с улучшенным дизайном */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{stats.total_tasks}</div>
                <div className="text-sm text-slate-400">Всего задач</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-300">
              <Activity className="w-4 h-4 mr-1" />
              Общий объем работы
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{stats.completed_tasks}</div>
                <div className="text-sm text-slate-400">Выполнено</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{completionRate}% от общего числа</span>
              <div className="flex items-center text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                {completionRate}%
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{stats.in_progress_tasks}</div>
                <div className="text-sm text-slate-400">В работе</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-300">
              <Zap className="w-4 h-4 mr-1" />
              Активные задачи
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl group-hover:from-red-500/30 group-hover:to-red-600/30 transition-all duration-300">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{stats.overdue_tasks}</div>
                <div className="text-sm text-slate-400">Просрочено</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{overdueRate}% от общего числа</span>
              <div className="flex items-center text-red-400">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {overdueRate}%
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Дополнительная статистика с улучшенным дизайном */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика по категориям */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl mr-4">
                <PieChart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">По категориям</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.by_category || {}).map(([category, count], index) => {
                const percentage = stats.total_tasks > 0 ? Math.round((count / stats.total_tasks) * 100) : 0
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600', 
                  'from-purple-500 to-purple-600',
                  'from-pink-500 to-pink-600',
                  'from-orange-500 to-orange-600',
                  'from-cyan-500 to-cyan-600'
                ]
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-300 capitalize font-medium">{category}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-700/50 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                          className={`bg-gradient-to-r ${colors[index % colors.length]} h-2 rounded-full shadow-sm`}
                        ></motion.div>
                      </div>
                      <span className="text-sm font-bold text-white min-w-[2rem] text-right">{count}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Статистика по приоритетам */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl mr-4">
                <Target className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">По приоритетам</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.by_priority || {}).map(([priority, count], index) => {
                const percentage = stats.total_tasks > 0 ? Math.round((count / stats.total_tasks) * 100) : 0
                const priorityConfig = {
                  low: { color: 'from-green-500 to-green-600', icon: '🟢' },
                  medium: { color: 'from-yellow-500 to-yellow-600', icon: '🟡' },
                  high: { color: 'from-orange-500 to-orange-600', icon: '🟠' },
                  urgent: { color: 'from-red-500 to-red-600', icon: '🔴' }
                }
                const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
                
                return (
                  <motion.div
                    key={priority}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm text-slate-300 capitalize font-medium">{priority}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-700/50 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                          className={`bg-gradient-to-r ${config.color} h-2 rounded-full shadow-sm`}
                        ></motion.div>
                      </div>
                      <span className="text-sm font-bold text-white min-w-[2rem] text-right">{count}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Прогресс выполнения с улучшенным дизайном */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="group"
      >
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 shadow-soft group-hover:shadow-glow">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl mr-4">
              <LineChart className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Прогресс выполнения</h3>
          </div>
          
          <div className="space-y-6">
            {/* Общий прогресс */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-300">Общий прогресс</span>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span className="text-2xl font-bold text-white">{completionRate}%</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-4 rounded-full shadow-glow"
                  ></motion.div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
              </div>
            </div>

            {/* Детальная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20"
              >
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.completed_tasks}</div>
                <div className="text-sm text-green-300">Выполнено</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 }}
                className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20"
              >
                <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.in_progress_tasks}</div>
                <div className="text-sm text-orange-300">В работе</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20"
              >
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.todo_tasks}</div>
                <div className="text-sm text-blue-300">К выполнению</div>
              </motion.div>
            </div>

            {/* Индикатор продуктивности */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="text-center p-6 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-600/50"
            >
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-lg font-medium text-slate-300">Индекс продуктивности</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{productivityScore}/100</div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${productivityScore}%` }}
                  transition={{ delay: 1.7, duration: 1.5 }}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full shadow-glow"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AnalyticsData {
  overview: {
    total_users: number
    active_users: number
    total_tasks: number
    completed_tasks: number
    total_teams: number
    total_projects: number
    system_uptime: string
  }
  user_activity: {
    date: string
    registrations: number
    logins: number
    tasks_created: number
    tasks_completed: number
  }[]
  task_stats: {
    by_status: { [key: string]: number }
    by_priority: { [key: string]: number }
    completion_rate: number
    average_completion_time: number
  }
  team_stats: {
    total_teams: number
    public_teams: number
    private_teams: number
    average_members: number
    most_active_teams: {
      id: string
      name: string
      activity_score: number
    }[]
  }
  performance: {
    response_time: number
    error_rate: number
    database_size: string
    cache_hit_rate: number
  }
}

const StatCard = ({ title, value, icon, color, trend }: { 
  title: string, 
  value: string | number, 
  icon: string, 
  color: string,
  trend?: { value: number, isPositive: boolean }
}) => (
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <span className="text-sm font-medium">
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={trend.isPositive ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"} />
          </svg>
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-gray-300 text-sm">{title}</p>
  </motion.div>
)

const Chart = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </motion.div>
)

const SimpleBarChart = ({ data, color = 'blue' }: { data: { [key: string]: number }, color?: string }) => {
  const maxValue = Math.max(...Object.values(data))
  const colorClass = `bg-${color}-500`
  
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-300 truncate">{key}</div>
          <div className="flex-1 bg-slate-700 rounded-full h-4 relative">
            <div 
              className={`h-4 rounded-full ${colorClass} transition-all duration-500`}
              style={{ width: `${(value / maxValue) * 100}%` }}
            ></div>
          </div>
          <div className="w-12 text-sm text-white text-right">{value}</div>
        </div>
      ))}
    </div>
  )
}

const LineChart = ({ data, title }: { data: { date: string, value: number }[], title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  return (
    <div className="h-64 relative">
      <div className="absolute inset-0 flex items-end space-x-1">
        {data.map((point, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500/20 rounded-t"
            style={{ 
              height: `${((point.value - minValue) / range) * 100}%`,
              minHeight: '4px'
            }}
            title={`${point.date}: ${point.value}`}
          ></div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((point, i) => (
          <span key={i}>{new Date(point.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}</span>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchAnalytics()
    }
  }, [user, token, timeRange])

  const fetchAnalytics = async () => {
    try {
      if (!token) {
        console.error('Токен не найден')
        setAnalytics(getMockData())
        setLoading(false)
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data || getMockData())
      } else {
        console.error('Ошибка загрузки аналитики:', response.status)
        setAnalytics(getMockData())
      }
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error)
      setAnalytics(getMockData())
    } finally {
      setLoading(false)
    }
  }

  const getMockData = (): AnalyticsData => ({
    overview: {
      total_users: 1250,
      active_users: 890,
      total_tasks: 5670,
      completed_tasks: 4230,
      total_teams: 156,
      total_projects: 89,
      system_uptime: '99.9%'
    },
    user_activity: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registrations: Math.floor(Math.random() * 20) + 5,
      logins: Math.floor(Math.random() * 100) + 50,
      tasks_created: Math.floor(Math.random() * 50) + 20,
      tasks_completed: Math.floor(Math.random() * 40) + 15
    })),
    task_stats: {
      by_status: {
        'Ожидают': 450,
        'В работе': 320,
        'Завершены': 4230,
        'Отменены': 80
      },
      by_priority: {
        'Низкий': 1200,
        'Средний': 2800,
        'Высокий': 1400,
        'Срочно': 270
      },
      completion_rate: 74.6,
      average_completion_time: 2.3
    },
    team_stats: {
      total_teams: 156,
      public_teams: 89,
      private_teams: 67,
      average_members: 4.2,
      most_active_teams: [
        { id: '1', name: 'Frontend Team', activity_score: 95 },
        { id: '2', name: 'Backend Team', activity_score: 87 },
        { id: '3', name: 'Design Team', activity_score: 82 },
        { id: '4', name: 'Marketing Team', activity_score: 78 },
        { id: '5', name: 'QA Team', activity_score: 75 }
      ]
    },
    performance: {
      response_time: 120,
      error_rate: 0.1,
      database_size: '2.4 GB',
      cache_hit_rate: 94.5
    }
  })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка аналитики...</div>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-300 hover:text-white">
                ← Назад к админ-панели
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Аналитика и отчеты</h1>
                <p className="text-gray-300 text-sm">Детальная статистика системы</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Последние 7 дней</option>
                <option value="30d">Последние 30 дней</option>
                <option value="90d">Последние 90 дней</option>
                <option value="1y">Последний год</option>
              </select>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Экспорт отчета
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <StatCard
            title="Всего пользователей"
            value={analytics.overview.total_users.toLocaleString()}
            icon="👥"
            color="bg-blue-500/20"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Активные пользователи"
            value={analytics.overview.active_users.toLocaleString()}
            icon="🟢"
            color="bg-green-500/20"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Всего задач"
            value={analytics.overview.total_tasks.toLocaleString()}
            icon="📋"
            color="bg-purple-500/20"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Завершено задач"
            value={analytics.overview.completed_tasks.toLocaleString()}
            icon="✅"
            color="bg-green-500/20"
            trend={{ value: 22, isPositive: true }}
          />
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StatCard
            title="Команды"
            value={analytics.overview.total_teams}
            icon="👥"
            color="bg-orange-500/20"
          />
          <StatCard
            title="Проекты"
            value={analytics.overview.total_projects}
            icon="📁"
            color="bg-indigo-500/20"
          />
          <StatCard
            title="Время работы"
            value={analytics.overview.system_uptime}
            icon="⚡"
            color="bg-green-500/20"
          />
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Chart title="Активность пользователей">
            <LineChart 
              data={analytics.user_activity.map(d => ({ date: d.date, value: d.logins }))}
              title="Входы в систему"
            />
          </Chart>

          <Chart title="Статусы задач">
            <SimpleBarChart data={analytics.task_stats.by_status} color="blue" />
          </Chart>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Chart title="Приоритеты задач">
            <SimpleBarChart data={analytics.task_stats.by_priority} color="purple" />
          </Chart>

          <Chart title="Создание задач">
            <LineChart 
              data={analytics.user_activity.map(d => ({ date: d.date, value: d.tasks_created }))}
              title="Новые задачи"
            />
          </Chart>
        </div>

        {/* Team Activity */}
        <Chart title="Самые активные команды">
          <div className="space-y-4">
            {analytics.team_stats.most_active_teams.map((team, index) => (
              <div key={team.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{team.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${team.activity_score}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-12 text-right">{team.activity_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </Chart>

        {/* Performance Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{analytics.performance.response_time}ms</div>
            <div className="text-gray-300 text-sm">Время отклика</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-400">{analytics.performance.error_rate}%</div>
            <div className="text-gray-300 text-sm">Ошибки</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.performance.database_size}</div>
            <div className="text-gray-300 text-sm">Размер БД</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="text-2xl font-bold text-orange-400">{analytics.performance.cache_hit_rate}%</div>
            <div className="text-gray-300 text-sm">Кэш попадания</div>
          </div>
        </motion.div>

        {/* Task Completion Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{analytics.task_stats.completion_rate}%</div>
            <div className="text-gray-300 text-lg mb-2">Процент завершения задач</div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                style={{ width: `${analytics.task_stats.completion_rate}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{analytics.task_stats.average_completion_time} дня</div>
            <div className="text-gray-300 text-lg">Среднее время выполнения</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AdminStats {
  users: {
    total: number
    active: number
    new_today: number
    by_role: { [key: string]: number }
  }
  tasks: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  teams: {
    total: number
    active: number
    public: number
  }
  projects: {
    total: number
    active: number
    completed: number
  }
  system: {
    uptime: string
    version: string
    last_backup: string
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

const QuickAction = ({ title, description, icon, href, color }: {
  title: string
  description: string
  icon: string
  href: string
  color: string
}) => (
  <Link href={href}>
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 cursor-pointer h-full flex flex-col"
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
      transition={{ duration: 0.2 }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} mb-3`}>
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">{title}</h3>
      <p className="text-gray-300 text-xs line-clamp-3 flex-grow">{description}</p>
    </motion.div>
  </Link>
)

interface Activity {
  type: string
  message: string
  timestamp: string
  icon: string
  color: string
}

export default function AdminDashboard() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchAdminStats()
      fetchRecentActivities()
    }
  }, [user, token])

  const fetchAdminStats = async () => {
    try {
      console.log('Fetching admin stats with token:', token ? 'Token exists' : 'No token')
      
      if (!token) {
        console.error('Токен не найден')
        setLoading(false)
        return
      }

      console.log('Making request to:', 'http://localhost:8000/api/admin/stats')
      
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        if (data.data) {
          setStats(data.data)
        } else {
          console.error('Данные статистики не найдены в ответе')
          setStats(null)
        }
      } else {
        const errorText = await response.text()
        console.error('Ошибка загрузки статистики:', response.status, errorText)
        setStats(null)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      if (!token) {
        console.error('Token not found')
        setActivities([])
        return
      }

      const response = await fetch('http://localhost:8000/api/admin/activities?limit=8', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const activitiesData = data.data || []
        setActivities(Array.isArray(activitiesData) ? activitiesData : [])
      } else {
        // Silently handle 404 or other errors - activities are optional
        if (response.status !== 404) {
          const errorText = await response.text()
          console.error('Error loading activities:', response.status, errorText)
        }
        setActivities([])
      }
    } catch (error) {
      // Silently handle network errors - activities are optional
      console.error('Error loading activities:', error)
      setActivities([])
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка админ-панели...</div>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
                <p className="text-gray-300 text-sm">Управление системой Serenity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Добро пожаловать, {user.name}</span>
              <Link 
                href="/"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Вернуться на сайт</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Обзор системы</h2>
          <p className="text-gray-300">Мониторинг и управление всеми аспектами платформы</p>
        </motion.div>

        {/* Stats Grid */}
        {stats && stats.users && stats.tasks && stats.teams && stats.projects && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatCard
              title="Всего пользователей"
              value={stats.users?.total ?? 0}
              icon="👥"
              color="bg-blue-500/20"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Активные задачи"
              value={stats.tasks?.total ?? 0}
              icon="📋"
              color="bg-green-500/20"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Завершенные задачи"
              value={stats.tasks?.completed ?? 0}
              icon="✅"
              color="bg-emerald-500/20"
              trend={{ value: 15, isPositive: true }}
            />
            <StatCard
              title="Команды"
              value={stats.teams?.total ?? 0}
              icon="👥"
              color="bg-purple-500/20"
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Проекты"
              value={stats.projects?.total ?? 0}
              icon="📁"
              color="bg-indigo-500/20"
              trend={{ value: 3, isPositive: true }}
            />
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="Управление пользователями"
              description="Просмотр, редактирование и управление пользователями"
              icon="👤"
              href="/admin/users"
              color="bg-blue-500/20"
            />
            <QuickAction
              title="Управление задачами"
              description="Мониторинг и управление всеми задачами"
              icon="📋"
              href="/admin/tasks"
              color="bg-green-500/20"
            />
            <QuickAction
              title="Управление командами"
              description="Администрирование команд и участников"
              icon="👥"
              href="/admin/teams"
              color="bg-purple-500/20"
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Последняя активность</h3>
          <div className="space-y-3">
            {activities.length > 0 ? activities.map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 text-gray-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`w-2 h-2 bg-${activity.color}-400 rounded-full flex items-center justify-center text-xs`}>
                  {activity.icon}
                </div>
                <span className="flex-1">{activity.message}</span>
                <span className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <div>Активность пользователей скоро появится здесь</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
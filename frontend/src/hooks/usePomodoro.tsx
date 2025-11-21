'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

interface PomodoroSession {
  id: string
  taskId?: string
  taskTitle?: string
  startTime: string
  endTime: string
  duration: number
  type: 'focus' | 'shortBreak' | 'longBreak'
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface PomodoroStats {
  total_sessions: number
  focus_sessions: number
  short_break_sessions: number
  long_break_sessions: number
  total_focus_time: number
  completed_sessions: number
  avg_focus_duration: number
}

interface LifetimeStats {
  total_sessions: number
  focus_sessions: number
  short_break_sessions: number
  long_break_sessions: number
  total_focus_time: number
  completed_sessions: number
  avg_focus_duration: number
  first_session_date: string
  last_session_date: string
  active_days: number
  total_focus_hours: number
}

interface WeeklyStats {
  week: string
  sessions: number
  focus_sessions: number
  focus_time: number
  active_days: number
}

interface MonthlyStats {
  month: string
  sessions: number
  focus_sessions: number
  focus_time: number
  active_days: number
}

interface DailyActivity {
  date: string
  sessions: number
  focus_sessions: number
  focus_time: number
}

interface TopTask {
  task_id: string
  task_title: string
  sessions_count: number
  total_duration: number
  avg_duration: number
  last_session: string
}

interface PomodoroFilters {
  type?: 'focus' | 'shortBreak' | 'longBreak'
  date_from?: string
  date_to?: string
  completed?: boolean
  limit?: number
}

export function usePomodoro() {
  const { token } = useAuth()
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [stats, setStats] = useState<PomodoroStats | null>(null)
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [topTasks, setTopTasks] = useState<TopTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use API base URL from environment
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, [token])

  const handleApiError = useCallback((error: any) => {
    console.error('Pomodoro API Error:', error)
    setError(error.message || 'Произошла ошибка при работе с Pomodoro API')
    setLoading(false)
  }, [])

  // Создать новую сессию
  const createSession = useCallback(async (sessionData: Omit<PomodoroSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!token) {
      throw new Error('Токен аутентификации не найден')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sessionData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка создания сессии')
      }

      const result = await response.json()
      const newSession = result.data

      setSessions(prev => [newSession, ...prev])
      return newSession
    } catch (error) {
      handleApiError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError])

  // Получить сессии
  const fetchSessions = useCallback(async (filters: PomodoroFilters = {}) => {
    if (!token) {
      setSessions([])
      setLoading(false)
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })

      const url = `${API_BASE_URL}/pomodoro/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения сессий')
      }

      const result = await response.json()
      setSessions(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError])

  // Получить статистику
  const fetchStats = useCallback(async (period: string = 'week') => {
    if (!token) {
      setStats(null)
      setLoading(false)
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/stats?period=${period}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения статистики')
      }

      const result = await response.json()
      setStats(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError, API_BASE_URL])

  // Получить общую статистику за все время
  const fetchLifetimeStats = useCallback(async () => {
    if (!token) {
      setLifetimeStats(null)
      setLoading(false)
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/stats/lifetime`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения общей статистики')
      }

      const result = await response.json()
      setLifetimeStats(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError, API_BASE_URL])

  // Получить недельную статистику
  const fetchWeeklyStats = useCallback(async (weeks: number = 12) => {
    if (!token) {
      setWeeklyStats([])
      setLoading(false)
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/stats/weekly?weeks=${weeks}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения недельной статистики')
      }

      const result = await response.json()
      setWeeklyStats(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError, API_BASE_URL])

  // Получить месячную статистику
  const fetchMonthlyStats = useCallback(async (months: number = 12) => {
    if (!token) {
      setMonthlyStats([])
      setLoading(false)
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/stats/monthly?months=${months}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения месячной статистики')
      }

      const result = await response.json()
      setMonthlyStats(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError, API_BASE_URL])

  // Получить дневную активность
  const fetchDailyActivity = useCallback(async (days: number = 7) => {
    if (!token) {
      setDailyActivity([])
      setLoading(false)
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/activity?days=${days}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения дневной активности')
      }

      const result = await response.json()
      setDailyActivity(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError, API_BASE_URL])

  // Получить топ задач
  const fetchTopTasks = useCallback(async (limit: number = 10) => {
    if (!token) {
      setTopTasks([])
      setLoading(false)
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/top-tasks?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения топ задач')
      }

      const result = await response.json()
      setTopTasks(result.data)
      return result.data
    } catch (error) {
      handleApiError(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError, API_BASE_URL])

  // Обновить сессию
  const updateSession = useCallback(async (sessionId: string, updateData: Partial<PomodoroSession>) => {
    if (!token) {
      throw new Error('Токен аутентификации не найден')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/sessions/${sessionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка обновления сессии')
      }

      const result = await response.json()
      const updatedSession = result.data

      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ))

      return updatedSession
    } catch (error) {
      handleApiError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError])

  // Удалить сессию
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!token) {
      throw new Error('Токен аутентификации не найден')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка удаления сессии')
      }

      setSessions(prev => prev.filter(session => session.id !== sessionId))
      return true
    } catch (error) {
      handleApiError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError])

  // Получить сессию по ID
  const getSession = useCallback(async (sessionId: string) => {
    if (!token) {
      throw new Error('Токен аутентификации не найден')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/pomodoro/sessions/${sessionId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка получения сессии')
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      handleApiError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders, handleApiError])

  // Загрузить все данные при инициализации
  const loadAllData = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      await Promise.all([
        fetchSessions({ limit: 50 }),
        fetchStats('week'),
        fetchLifetimeStats(),
        fetchWeeklyStats(12),
        fetchMonthlyStats(12),
        fetchDailyActivity(7),
        fetchTopTasks(10)
      ])
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }, [token, fetchSessions, fetchStats, fetchLifetimeStats, fetchWeeklyStats, fetchMonthlyStats, fetchDailyActivity, fetchTopTasks, handleApiError])

  // Очистить ошибку
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Данные
    sessions,
    stats,
    lifetimeStats,
    weeklyStats,
    monthlyStats,
    dailyActivity,
    topTasks,
    loading,
    error,

    // Методы
    createSession,
    fetchSessions,
    fetchStats,
    fetchLifetimeStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
    fetchDailyActivity,
    fetchTopTasks,
    updateSession,
    deleteSession,
    getSession,
    loadAllData,
    clearError
  }
}


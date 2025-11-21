'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { Task, TaskStats, TaskFilters } from '@/lib/utils'

interface UseTasksResult {
  tasks: Task[]
  stats: TaskStats | null
  loading: boolean
  error: string | null
  fetchTasks: (filters?: TaskFilters) => Promise<void>
  createTask: (taskData: Partial<Task>) => Promise<void>
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  fetchStats: () => Promise<void>
  fetchOverdueTasks: () => Promise<Task[]>
  fetchTodayTasks: () => Promise<Task[]>
}

export function useTasks(): UseTasksResult {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    if (!token) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      
      // Добавляем фильтры в query параметры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(','))
            }
          } else {
            queryParams.append(key, String(value))
          }
        }
      })

      const query = queryParams.toString()
      const response = await fetch(`${API_BASE_URL}/api/tasks?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Не удалось получить задачи')
      }

      const data = await response.json()
      setTasks(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке задач')
      console.error('Fetch tasks error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, API_BASE_URL])

  const fetchStats = useCallback(async () => {
    if (!token) {
      setStats(null)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Не удалось получить статистику')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (err: any) {
      console.error('Fetch stats error:', err)
    }
  }, [token, API_BASE_URL])

  const fetchOverdueTasks = useCallback(async (): Promise<Task[]> => {
    if (!token) return []

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/overdue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Не удалось получить просроченные задачи')
      }

      const data = await response.json()
      return data.data || []
    } catch (err: any) {
      console.error('Fetch overdue tasks error:', err)
      return []
    }
  }, [token, API_BASE_URL])

  const fetchTodayTasks = useCallback(async (): Promise<Task[]> => {
    if (!token) return []

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Не удалось получить задачи на сегодня')
      }

      const data = await response.json()
      return data.data || []
    } catch (err: any) {
      console.error('Fetch today tasks error:', err)
      return []
    }
  }, [token, API_BASE_URL])

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    console.log('createTask called with:', taskData)
    console.log('Token exists:', !!token)
    console.log('API_BASE_URL:', API_BASE_URL)
    
    if (!token) {
      console.error('No token available for task creation')
      setError('Не авторизован')
      return
    }

    setLoading(true)
    setError(null)
    try {
      console.log('Making POST request to:', `/api/tasks`)
      console.log('Request headers:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json',
      })
      console.log('Request body:', JSON.stringify(taskData))

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        
        // Если есть детальные ошибки валидации, показываем их
        if (errorData.errors && Object.keys(errorData.errors).length > 0) {
          const errorMessages = Object.values(errorData.errors).join(', ')
          throw new Error(`Ошибки валидации: ${errorMessages}`)
        }
        
        throw new Error(errorData.message || 'Не удалось создать задачу')
      }

      const result = await response.json()
      console.log('Task created successfully:', result)

      // Обновляем список задач и статистику
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err: any) {
      console.error('Create task error:', err)
      setError(err.message || 'Ошибка при создании задачи')
    } finally {
      setLoading(false)
    }
  }, [token, fetchTasks, fetchStats, API_BASE_URL])

  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
    if (!token) {
      setError('Не авторизован')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Не удалось обновить задачу')
      }

      // Обновляем список задач и статистику
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении задачи')
      console.error('Update task error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, fetchTasks, fetchStats, API_BASE_URL])

  const deleteTask = useCallback(async (taskId: string) => {
    if (!token) {
      setError('Не авторизован')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Не удалось удалить задачу')
      }

      // Обновляем список задач и статистику
      await Promise.all([fetchTasks(), fetchStats()])
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении задачи')
      console.error('Delete task error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, fetchTasks, fetchStats, API_BASE_URL])

  useEffect(() => {
    if (token) {
      fetchTasks()
      fetchStats()
    }
  }, [token, fetchTasks, fetchStats])

  return { 
    tasks, 
    stats, 
    loading, 
    error, 
    fetchTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    fetchStats, 
    fetchOverdueTasks, 
    fetchTodayTasks 
  }
}
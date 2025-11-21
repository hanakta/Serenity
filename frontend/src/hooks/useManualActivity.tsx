'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

interface ManualActivityData {
  title: string
  description: string
  category: string
}

interface ManualActivity {
  id: string
  team_id: string
  user_id: string
  activity_type: 'manual_activity'
  activity_data: {
    title: string
    description: string
    category: string
    created_manually: boolean
  }
  target_id: null
  target_type: null
  created_at: string
}

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function useManualActivity() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, [token])

  const createManualActivity = useCallback(async (teamId: string, data: ManualActivityData): Promise<ManualActivity> => {
    if (!token) {
      throw new Error('Токен аутентификации не найден')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/collaboration/manual-activity`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка создания активности')
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [token, getAuthHeaders])

  return {
    createManualActivity,
    loading,
    error,
    clearError: () => setError(null)
  }
}




















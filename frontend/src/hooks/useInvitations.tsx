'use client'

import { useState, useCallback } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export const useInvitations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Отправить приглашение
  const sendInvitation = useCallback(async (teamId: string, email: string, role: string = 'member') => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Токен не найден')
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка отправки приглашения')
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки приглашения')
      console.error('Ошибка отправки приглашения:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Получить приглашения команды
  const getTeamInvitations = useCallback(async (teamId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Токен не найден')
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки приглашений')
      }

      const data = await response.json()
      return data.data?.invitations || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки приглашений')
      console.error('Ошибка загрузки приглашений:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Получить приглашения пользователя
  const getUserInvitations = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Токен не найден')
      }

      const response = await fetch(`${API_BASE_URL}/api/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки приглашений')
      }

      const data = await response.json()
      return data.data?.invitations || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки приглашений')
      console.error('Ошибка загрузки приглашений:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Получить информацию о приглашении по токену
  const getInvitationInfo = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/invitations/${token}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Приглашение не найдено или просрочено')
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки информации о приглашении')
      console.error('Ошибка загрузки информации о приглашении:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Принять приглашение
  const acceptInvitation = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const userToken = getToken()
      if (!userToken) {
        throw new Error('Токен не найден')
      }

      const response = await fetch(`${API_BASE_URL}/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка принятия приглашения')
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка принятия приглашения')
      console.error('Ошибка принятия приглашения:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Отклонить приглашение
  const declineInvitation = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/invitations/${token}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка отклонения приглашения')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отклонения приглашения')
      console.error('Ошибка отклонения приглашения:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    sendInvitation,
    getTeamInvitations,
    getUserInvitations,
    getInvitationInfo,
    acceptInvitation,
    declineInvitation
  }
}

'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { API_BASE_URL } from '@/lib/constants'
import { clearApplicationState, isTokenValid, getUserIdFromToken } from '@/lib/stateManager'
import { setCurrentUser, checkAndClearState, registerStateListener, forceClearAllData, forceClearAllDataWithReload, softCheckAndClearState } from '@/lib/userStateManager'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем токен в localStorage при загрузке
    const savedToken = localStorage.getItem('token')
    
    // Проверяем, изменился ли пользователь
    checkAndClearState(savedToken)
    
    if (savedToken && isTokenValid(savedToken)) {
      setToken(savedToken)
      
      // Устанавливаем текущего пользователя
      const userId = getUserIdFromToken(savedToken)
      if (userId) {
        setCurrentUser(userId)
      }
      
      // Проверяем валидность токена на сервере
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUser(data.data)
        } else {
          // Токен недействителен, очищаем все состояние
          clearApplicationState()
          setToken(null)
          setUser(null)
        }
      })
      .catch(() => {
        // Ошибка сети, очищаем все состояние
        clearApplicationState()
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
    } else {
      // Нет токена или токен недействителен
      if (savedToken) {
        clearApplicationState()
      }
      setToken(null)
      setUser(null)
      setIsLoading(false)
    }

    // Регистрируем слушатель для очистки состояния
    const unregister = registerStateListener(() => {
      setToken(null)
      setUser(null)
    })

    // Слушаем события обновления пользователя
    const handleUserUpdate = (event: CustomEvent) => {
      setUser(event.detail)
    }

    window.addEventListener('userUpdated', handleUserUpdate as EventListener)
    
    return () => {
      unregister()
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Если есть детальные ошибки валидации, показываем их
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorMessages = Object.values(data.errors).join(', ')
        throw new Error(errorMessages)
      }
      throw new Error(data.message || 'Ошибка входа')
    }

    // Очищаем состояние перед установкой нового токена
    softCheckAndClearState(data.data.token)
    
    console.log('Setting token and user after login:', { 
      token: data.data.token.substring(0, 20) + '...', 
      user: data.data.user 
    });
    
    localStorage.setItem('token', data.data.token)
    setToken(data.data.token)
    setUser(data.data.user)
    
    // Устанавливаем текущего пользователя
    const userId = getUserIdFromToken(data.data.token)
    if (userId) {
      setCurrentUser(userId)
      console.log('Current user set:', userId);
    }
  }

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, confirmPassword: confirmPassword || password }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Если есть детальные ошибки валидации, показываем их
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorMessages = Object.values(data.errors).join(', ')
        throw new Error(errorMessages)
      }
      throw new Error(data.message || 'Ошибка регистрации')
    }

    // Очищаем состояние перед установкой нового токена
    softCheckAndClearState(data.data.token)
    
    localStorage.setItem('token', data.data.token)
    setToken(data.data.token)
    setUser(data.data.user)
    
    // Устанавливаем текущего пользователя
    const userId = getUserIdFromToken(data.data.token)
    if (userId) {
      setCurrentUser(userId)
    }
  }

  const logout = () => {
    // Принудительная очистка всех данных с перезагрузкой
    forceClearAllDataWithReload()
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

'use client'

import { useState, useEffect } from 'react'

interface CookieConsentProps {
  onAccept: () => void
  onDecline: () => void
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие на cookies
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = async () => {
    try {
      // Сохраняем в localStorage
      localStorage.setItem('cookieConsent', 'accepted')
      
      // Отправляем на сервер
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await fetch(`${API_BASE_URL}/api/cookies/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accepted: true,
          consent_type: 'all',
          cookie_types: {
            1: true, // essential
            2: true, // functional
            3: true, // analytics
            4: true  // marketing
          }
        })
      })
      
      setIsVisible(false)
      onAccept()
    } catch (error) {
      console.error('Ошибка сохранения согласия:', error)
      // Все равно скрываем баннер, даже если сервер недоступен
      setIsVisible(false)
      onAccept()
    }
  }

  const handleDecline = async () => {
    try {
      // Сохраняем в localStorage
      localStorage.setItem('cookieConsent', 'declined')
      
      // Отправляем на сервер
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await fetch(`${API_BASE_URL}/api/cookies/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accepted: false,
          consent_type: 'none',
          cookie_types: {
            1: true,  // essential (обязательные)
            2: false, // functional
            3: false, // analytics
            4: false  // marketing
          }
        })
      })
      
      setIsVisible(false)
      onDecline()
    } catch (error) {
      console.error('Ошибка сохранения отказа:', error)
      // Все равно скрываем баннер
      setIsVisible(false)
      onDecline()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900/95 to-purple-900/95 backdrop-blur-lg border-t border-white/20 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Мы используем cookies
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Мы используем cookies для улучшения вашего опыта, запоминания настроек и обеспечения безопасности. 
              Cookies помогают нам предоставлять персонализированный контент и автоматический вход в систему.
            </p>
            <div className="mt-2 text-xs text-gray-400">
              <details className="cursor-pointer">
                <summary className="hover:text-gray-300 transition-colors">
                  Подробнее о cookies
                </summary>
                <div className="mt-2 space-y-1">
                  <p><strong>Обязательные cookies:</strong> Необходимы для работы сайта</p>
                  <p><strong>Функциональные cookies:</strong> Запоминают ваши настройки и предпочтения</p>
                  <p><strong>Безопасность:</strong> Обеспечивают безопасную аутентификацию</p>
                  <p><strong>Аналитика:</strong> Помогают улучшать наш сервис</p>
                </div>
              </details>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors border border-gray-600/50 hover:border-gray-500 rounded-lg"
            >
              Отклонить
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-lg hover:shadow-blue-500/25"
            >
              Принять все
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

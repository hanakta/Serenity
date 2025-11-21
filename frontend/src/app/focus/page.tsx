'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useTasks } from '@/hooks/useTasks'
import { usePomodoro } from '@/hooks/usePomodoro'
import { motion } from 'framer-motion'
import PomodoroTimer from '@/components/PomodoroTimer'
import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import PremiumUserProfile from '@/components/PremiumUserProfile'
import PremiumSettingsButton from '@/components/PremiumSettingsButton'

export default function FocusPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    fetchTasks,
  } = useTasks()

  const {
    sessions,
    stats,
    dailyActivity,
    topTasks,
    loading: pomodoroLoading,
    error: pomodoroError,
    loadAllData
  } = usePomodoro()

  useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.push('/login')
    }
  }, [isClient, user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchTasks({})
      loadAllData()
    }
  }, [user, fetchTasks, loadAllData])

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <div className="text-white text-2xl font-medium">Загрузка...</div>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSessionComplete = (session: any) => {
    console.log('Pomodoro session completed:', session)
    // Здесь можно добавить логику для сохранения сессии в базу данных
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Navigation */}
      <MobileNavigation
        currentView="focus"
        onViewChange={(view) => {
          if (view === 'focus') {
            // Остаемся на текущей странице
            return
          } else if (view === 'collaboration') {
            router.push('/collaboration')
          } else if (view === 'analytics') {
            router.push('/analytics')
          } else {
            // Для всех остальных вкладок переходим на главную страницу
            router.push(`/?view=${view}`)
          }
        }}
        onCreateTask={() => router.push('/')}
        isOpen={false}
        onToggle={() => {}}
      />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          currentView="focus"
          onViewChange={(view) => {
            if (view === 'focus') {
              // Остаемся на текущей странице
              return
            } else if (view === 'collaboration') {
              router.push('/collaboration')
            } else if (view === 'analytics') {
              router.push('/analytics')
            } else {
              // Для всех остальных вкладок переходим на главную страницу
              router.push(`/?view=${view}`)
            }
          }}
          onCreateTask={() => router.push('/')}
          user={user}
          onCollapseChange={setIsSidebarCollapsed}
        />
      )}

      {/* Main Content */}
      <motion.div 
        className="min-h-screen"
        animate={{ 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px')
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 py-4 md:py-6 px-4 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Фокус
              </h2>
              <p className="text-slate-400 text-xs md:text-sm hidden md:block">
                Pomodoro таймер для повышения продуктивности
              </p>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-6 flex-shrink-0">
              {/* Кнопка тарифов */}
              <motion.button
                onClick={() => router.push('/pricing')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center space-x-2">
                  <span>💎</span>
                  <span>Привилегии</span>
                </span>
              </motion.button>
              
              {/* Кнопка настроек */}
              <PremiumSettingsButton 
                onClick={() => router.push('/')}
                isActive={false}
              />
              
              {/* Профиль пользователя */}
              <PremiumUserProfile 
                user={user}
                onLogout={logout}
                onEdit={() => router.push('/')}
                isActive={false}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PomodoroTimer 
              tasks={tasks}
              onSessionComplete={handleSessionComplete}
            />
          </motion.div>
        </main>
      </motion.div>
    </div>
  )
}

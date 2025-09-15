'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useTasks } from '@/hooks/useTasks'
import { useTeams } from '@/hooks/useTeams'
import { Task, TaskFilters as TaskFiltersType } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, BarChart3, Calendar, AlertTriangle, Bell, Settings, User, Shield, Users, MessageSquare, Home, TrendingUp, Zap, Star, Heart, Sparkles, Target, Award, Rocket } from 'lucide-react'

// Components
// import AnimatedBackground from '@/components/AnimatedBackground'
import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import PremiumTaskCard from '@/components/PremiumTaskCard'
import PremiumTaskModal from '@/components/PremiumTaskModal'
import PremiumSettingsButton from '@/components/PremiumSettingsButton'
import PremiumUserProfile from '@/components/PremiumUserProfile'
import ProfileSettingsModal from '@/components/ProfileSettingsModal'
import SecuritySettingsModal from '@/components/SecuritySettingsModal'
import NotificationSettingsModal from '@/components/NotificationSettingsModal'
import ThemeSettingsModal from '@/components/ThemeSettingsModal'
import DataSettingsModal from '@/components/DataSettingsModal'
import AboutModal from '@/components/AboutModal'
import StatsCard from '@/components/StatsCard'
import TaskFilters from '@/components/TaskFilters'
import TaskStats from '@/components/TaskStats'
import CalendarView from '@/components/CalendarView'
import NotificationsView from '@/components/NotificationsView'
import TeamsSection from '@/components/TeamsSection'
import PublicTeamsSection from '@/components/PublicTeamsSection'
import UserStateDebugger from '@/components/UserStateDebugger'

export default function HomePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    tasks,
    stats,
    loading: tasksLoading,
    error: tasksError,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchStats,
    fetchOverdueTasks,
    fetchTodayTasks,
  } = useTasks()

  const { teams } = useTeams()


  // UI State
  const [currentView, setCurrentView] = useState('dashboard')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<TaskFiltersType>({})

  // Перенаправление на страницу коллаборации
  useEffect(() => {
    if (currentView === 'collaboration' && typeof window !== 'undefined') {
      router.replace('/collaboration')
    }
  }, [currentView, router])
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Settings Modals
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Загружаем сохраненную тему
    const loadTheme = () => {
      const savedTheme = localStorage.getItem('theme-settings')
      if (savedTheme) {
        try {
          const theme = JSON.parse(savedTheme)
          const root = document.documentElement
          root.setAttribute('data-theme', theme.mode)
          root.setAttribute('data-primary-color', theme.primaryColor)
          root.setAttribute('data-font-size', theme.fontSize)
          root.setAttribute('data-compact-mode', theme.compactMode.toString())
          root.setAttribute('data-animations', theme.animations.toString())
          root.setAttribute('data-particles', theme.particles.toString())
          root.setAttribute('data-glassmorphism', theme.glassmorphism.toString())
          
          // Применяем пользовательский CSS
          if (theme.customCSS) {
            let customStyle = document.getElementById('custom-theme-css')
            if (!customStyle) {
              customStyle = document.createElement('style')
              customStyle.id = 'custom-theme-css'
              document.head.appendChild(customStyle)
            }
            customStyle.textContent = theme.customCSS
          }
        } catch (error) {
          console.error('Error loading theme:', error)
        }
      }
    }
    
    loadTheme()
    
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
      fetchTasks(filters)
      fetchStats()
      loadOverdueAndTodayTasks()
    }
  }, [user, filters, fetchTasks, fetchStats])


  const loadOverdueAndTodayTasks = async () => {
    const [overdue, today] = await Promise.all([
      fetchOverdueTasks(),
      fetchTodayTasks(),
    ])
    setOverdueTasks(overdue)
    setTodayTasks(today)
  }

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

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await createTask(taskData)
    setShowTaskModal(false)
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleEditTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
      setEditingTask(null)
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await deleteTask(task.id)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    await updateTask(task.id, { status: newStatus })
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleCloseModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
  }

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  // Settings handlers
  const handleProfileSave = async (data: { name: string; email: string; password?: string }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Токен не найден')
      }

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка обновления профиля')
      }

      const result = await response.json()
      console.log('Profile updated:', result)
      
      // Обновляем пользователя в контексте
      if (result.data?.user) {
        // Здесь нужно обновить контекст пользователя
        window.location.reload() // Простое обновление страницы
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Токен не найден')
      }

      const response = await fetch('http://localhost:8000/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка изменения пароля')
      }

      const result = await response.json()
      console.log('Password changed:', result)
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  const handleNotificationSave = async (settings: any) => {
    // TODO: Implement notification settings API call
    console.log('Saving notification settings:', settings)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleThemeSave = async (theme: any) => {
    try {
      // Сохраняем тему в localStorage
      localStorage.setItem('theme-settings', JSON.stringify(theme))
      
      // Применяем тему к документу
      const root = document.documentElement
      root.setAttribute('data-theme', theme.mode)
      root.setAttribute('data-primary-color', theme.primaryColor)
      root.setAttribute('data-font-size', theme.fontSize)
      root.setAttribute('data-compact-mode', theme.compactMode.toString())
      root.setAttribute('data-animations', theme.animations.toString())
      root.setAttribute('data-particles', theme.particles.toString())
      root.setAttribute('data-glassmorphism', theme.glassmorphism.toString())
      
      // Применяем пользовательский CSS
      let customStyle = document.getElementById('custom-theme-css')
      if (!customStyle) {
        customStyle = document.createElement('style')
        customStyle.id = 'custom-theme-css'
        document.head.appendChild(customStyle)
      }
      customStyle.textContent = theme.customCSS
      
      console.log('Theme settings saved and applied:', theme)
      
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving theme:', error)
      throw error
    }
  }

  const handleExport = async (format: string) => {
    try {
      // Подготавливаем данные для экспорта
      const exportData = {
        tasks: tasks,
        user: user,
        settings: {
          theme: localStorage.getItem('theme-settings'),
          notifications: localStorage.getItem('notification-settings')
        },
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }

      let blob: Blob
      let filename: string
      let mimeType: string

      switch (format) {
        case 'json':
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.json`
          mimeType = 'application/json'
          break

        case 'csv':
          const csvContent = convertTasksToCSV(tasks)
          blob = new Blob([csvContent], { type: 'text/csv' })
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
          mimeType = 'text/csv'
          break

        case 'pdf':
          // Для PDF используем простой текстовый формат
          const pdfContent = generatePDFContent(exportData)
          blob = new Blob([pdfContent], { type: 'text/plain' })
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.txt`
          mimeType = 'text/plain'
          break

        case 'xlsx':
          // Для Excel используем CSV формат
          const excelContent = convertTasksToCSV(tasks)
          blob = new Blob([excelContent], { type: 'text/csv' })
          filename = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
          mimeType = 'text/csv'
          break

        default:
          throw new Error('Неподдерживаемый формат экспорта')
      }

      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log(`Данные экспортированы в формате ${format}`)
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      throw error
    }
  }

  const handleImport = async (file: File) => {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension) {
        throw new Error('Неизвестный формат файла')
      }

      const fileContent = await readFileContent(file)
      let importedTasks: any[] = []

      switch (fileExtension) {
        case 'json':
          const jsonData = JSON.parse(fileContent)
          if (jsonData.tasks && Array.isArray(jsonData.tasks)) {
            importedTasks = jsonData.tasks
          } else if (Array.isArray(jsonData)) {
            importedTasks = jsonData
          } else {
            throw new Error('Неверный формат JSON файла')
          }
          break

        case 'csv':
          importedTasks = parseCSVToTasks(fileContent)
          break

        case 'xlsx':
        case 'xls':
          // Для Excel файлов используем CSV парсинг
          importedTasks = parseCSVToTasks(fileContent)
          break

        default:
          throw new Error(`Неподдерживаемый формат файла: ${fileExtension}`)
      }

      // Импортируем задачи
      let importedCount = 0
      for (const taskData of importedTasks) {
        try {
          // Преобразуем данные задачи в нужный формат
          const taskToCreate = {
            title: taskData.title || taskData.Название || 'Импортированная задача',
            description: taskData.description || taskData.Описание || '',
            priority: taskData.priority || taskData.Приоритет || 'medium',
            due_date: taskData.due_date || taskData['Дата выполнения'] || null,
            tags: taskData.tags || taskData.Теги || []
          }

          await createTask(taskToCreate)
          importedCount++
        } catch (error) {
          console.warn('Ошибка импорта задачи:', error)
        }
      }

      // Обновляем список задач
      await fetchTasks(filters)
      
      console.log(`Импортировано ${importedCount} задач из файла ${file.name}`)
    } catch (error) {
      console.error('Ошибка импорта:', error)
      throw error
    }
  }

  // Вспомогательные функции для импорта
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Ошибка чтения файла'))
        }
      }
      reader.onerror = () => reject(new Error('Ошибка чтения файла'))
      reader.readAsText(file)
    })
  }

  const parseCSVToTasks = (csvContent: string): any[] => {
    const lines = csvContent.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const tasks: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length !== headers.length) continue

      const task: any = {}
      headers.forEach((header, index) => {
        const value = values[index]
        switch (header.toLowerCase()) {
          case 'id':
            task.id = value
            break
          case 'название':
          case 'title':
            task.title = value
            break
          case 'описание':
          case 'description':
            task.description = value
            break
          case 'статус':
          case 'status':
            task.status = value.toLowerCase() === 'выполнено' || value.toLowerCase() === 'completed' ? 'completed' : 'todo'
            break
          case 'приоритет':
          case 'priority':
            task.priority = value.toLowerCase()
            break
          case 'дата создания':
          case 'created_at':
            task.created_at = value
            break
          case 'дата выполнения':
          case 'due_date':
            task.due_date = value
            break
          case 'теги':
          case 'tags':
            task.tags = value ? value.split(',').map(t => t.trim()) : []
            break
        }
      })
      
      if (task.title) {
        tasks.push(task)
      }
    }

    return tasks
  }

  const handleDelete = async (type: string) => {
    try {
      switch (type) {
        case 'tasks':
          // Удаляем все задачи
          for (const task of tasks) {
            await deleteTask(task.id)
          }
          break
        case 'settings':
          // Очищаем настройки
          localStorage.removeItem('theme-settings')
          localStorage.removeItem('notification-settings')
          break
        case 'notifications':
          // Очищаем уведомления (если есть)
          console.log('Удаление истории уведомлений')
          break
        case 'analytics':
          // Очищаем аналитику
          console.log('Удаление аналитических данных')
          break
        default:
          throw new Error('Неизвестный тип данных')
      }
      console.log(`Данные типа "${type}" удалены`)
    } catch (error) {
      console.error('Ошибка удаления:', error)
      throw error
    }
  }

  // Вспомогательные функции для экспорта
  const convertTasksToCSV = (tasks: Task[]): string => {
    const headers = ['ID', 'Название', 'Описание', 'Статус', 'Приоритет', 'Дата создания', 'Дата выполнения', 'Теги']
    const rows = tasks.map(task => [
      task.id,
      `"${task.title}"`,
      `"${task.description || ''}"`,
      task.status === 'completed' ? 'Выполнено' : 'В процессе',
      task.priority || 'Средний',
      new Date(task.created_at).toLocaleDateString('ru-RU'),
      task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : '',
      `"${(task.tags || []).join(', ')}"`
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generatePDFContent = (data: any): string => {
    let content = 'ЭКСПОРТ ДАННЫХ ЗАДАЧ\n'
    content += '='.repeat(50) + '\n\n'
    content += `Дата экспорта: ${new Date(data.exportDate).toLocaleString('ru-RU')}\n`
    content += `Пользователь: ${data.user?.name || 'Неизвестно'}\n`
    content += `Версия: ${data.version}\n\n`
    
    content += 'ЗАДАЧИ:\n'
    content += '-'.repeat(30) + '\n'
    
    data.tasks.forEach((task: Task, index: number) => {
      content += `${index + 1}. ${task.title}\n`
      if (task.description) {
        content += `   Описание: ${task.description}\n`
      }
      content += `   Статус: ${task.status === 'completed' ? 'Выполнено' : 'В процессе'}\n`
      content += `   Приоритет: ${task.priority || 'Средний'}\n`
      if (task.due_date) {
        content += `   Срок: ${new Date(task.due_date).toLocaleDateString('ru-RU')}\n`
      }
      if (task.tags && task.tags.length > 0) {
        content += `   Теги: ${task.tags.join(', ')}\n`
      }
      content += '\n'
    })
    
    return content
  }

  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-8 backdrop-blur-xl border border-slate-700/50 shadow-glow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Мои задачи</h3>
                  <p className="text-slate-400 text-lg">
                    Управляйте своими задачами и отслеживайте прогресс
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {tasks.length}
                    </div>
                    <div className="text-sm text-slate-400">
                      {tasks.filter(t => t.status === 'completed').length} выполнено
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowTaskModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Создать задачу</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
            <TaskFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
            </motion.div>

            {/* Error State */}
            {tasksError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{tasksError}</span>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {tasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30"
                  >
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-slate-700 rounded mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-slate-700 rounded-full w-16"></div>
                        <div className="h-6 bg-slate-700 rounded-full w-20"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : tasks.filter(task => task.status !== 'completed').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tasks
                  .filter(task => task.status !== 'completed')
                  .map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PremiumTaskCard
                    task={task}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    index={index}
                  />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-slate-700/30">
                  <Search className="w-16 h-16 text-slate-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Задач не найдено</h3>
                <p className="text-slate-400 mb-8 text-lg max-w-md mx-auto">
                  {Object.keys(filters).length > 0
                    ? 'Попробуйте изменить фильтры или создать новую задачу'
                    : 'Создайте свою первую задачу, чтобы начать работу'
                  }
                </p>
                <motion.button
                  onClick={() => setShowTaskModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Создать задачу</span>
                </motion.button>
              </motion.div>
            )}
        </div>
        )

      case 'teams':
        return (
          <div className="space-y-8">
            <TeamsSection />
          </div>
        )

      case 'public-teams':
        return (
          <div className="space-y-8">
            <PublicTeamsSection />
          </div>
        )

      case 'collaboration':
        // Перенаправление обрабатывается в useEffect
        return null

      case 'analytics':
        return <TaskStats stats={stats} loading={tasksLoading} />

      case 'calendar':
        return <CalendarView onCreateTask={() => setShowTaskModal(true)} />

      case 'notifications':
        return <NotificationsView onCreateTask={() => setShowTaskModal(true)} />

      case 'settings':
        return (
          <div className="space-y-8">
            {/* Заголовок */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
                Настройки аккаунта
              </h2>
              <p className="text-xl text-slate-300">
                Управляйте своим профилем и настройками
              </p>
            </motion.div>

            {/* Карточки настроек */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Профиль */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Профиль</h3>
                    <p className="text-slate-400 text-sm">Личная информация</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Управляйте своим именем, email и аватаром
                </p>
                <motion.button 
                  onClick={() => setShowProfileModal(true)}
                  className="w-full py-2 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-colors border border-blue-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Редактировать
                </motion.button>
              </motion.div>

              {/* Безопасность */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Безопасность</h3>
                    <p className="text-slate-400 text-sm">Пароль и доступ</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Измените пароль и настройки безопасности
                </p>
                <motion.button 
                  onClick={() => setShowSecurityModal(true)}
                  className="w-full py-2 px-4 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl transition-colors border border-green-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Настроить
                </motion.button>
              </motion.div>

              {/* Уведомления */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                    <Bell className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Уведомления</h3>
                    <p className="text-slate-400 text-sm">Напоминания и алерты</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Настройте уведомления и напоминания
                </p>
                <motion.button 
                  onClick={() => setShowNotificationModal(true)}
                  className="w-full py-2 px-4 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-colors border border-purple-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Настроить
                </motion.button>
              </motion.div>

              {/* Тема */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl group-hover:from-orange-500/30 group-hover:to-yellow-500/30 transition-all duration-300">
                    <Settings className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Тема</h3>
                    <p className="text-slate-400 text-sm">Внешний вид</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Выберите тему оформления
                </p>
                <motion.button 
                  onClick={() => setShowThemeModal(true)}
                  className="w-full py-2 px-4 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-xl transition-colors border border-orange-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Изменить
                </motion.button>
              </motion.div>

              {/* Данные */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Данные</h3>
                    <p className="text-slate-400 text-sm">Экспорт и импорт</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Управляйте своими данными
                </p>
                <motion.button 
                  onClick={() => setShowDataModal(true)}
                  className="w-full py-2 px-4 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-xl transition-colors border border-cyan-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Управлять
                </motion.button>
              </motion.div>

              {/* О программе */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-gradient hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl group-hover:from-pink-500/30 group-hover:to-rose-500/30 transition-all duration-300">
                    <Calendar className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">О программе</h3>
                    <p className="text-slate-400 text-sm">Версия и информация</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Информация о приложении
                </p>
                <motion.button 
                  onClick={() => setShowAboutModal(true)}
                  className="w-full py-2 px-4 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-xl transition-colors border border-pink-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Подробнее
                </motion.button>
              </motion.div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 relative overflow-hidden"
            >
              {/* Enhanced Animated Background Elements */}
              <div className="absolute inset-0 -z-10">
                {/* Floating orbs */}
                <motion.div
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{
                    x: [0, 60, 0],
                    y: [0, -40, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute bottom-10 left-1/3 w-36 h-36 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-2xl"
                />
                
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
              </div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-500/30 rounded-full mb-8 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  </motion.div>
                  <span className="text-blue-300 font-medium text-sm">Премиум версия</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-8 leading-tight"
                >
                  Добро пожаловать в
                  <br />
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent relative"
                  >
                    Serenity
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-xl rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    />
                  </motion.span>
                </motion.h1>
                
                
                
              </div>
            </motion.div>

            {/* Enhanced Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                      <BarChart3 className="w-8 h-8 text-blue-400" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.6, duration: 0.3 }}
                      className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                    />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    {stats?.total_tasks || 0}
                  </div>
                  <div className="text-slate-400 font-medium">Всего задач</div>
                  <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1.8, duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                      <Calendar className="w-8 h-8 text-green-400" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.7, duration: 0.3 }}
                      className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
                    />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
                    {stats?.completed_tasks || 0}
                  </div>
                  <div className="text-slate-400 font-medium">Выполнено</div>
                  <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats?.completed_tasks || 0) / Math.max(stats?.total_tasks || 1, 1) * 100, 100)}%` }}
                      transition={{ delay: 1.9, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
                </div>
              </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl group-hover:from-orange-500/30 group-hover:to-yellow-500/30 transition-all duration-300">
                      <Filter className="w-8 h-8 text-orange-400" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.8, duration: 0.3 }}
                      className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"
                    />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
                    {stats?.in_progress_tasks || 0}
                  </div>
                  <div className="text-slate-400 font-medium">В работе</div>
                  <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats?.in_progress_tasks || 0) / Math.max(stats?.total_tasks || 1, 1) * 100, 100)}%` }}
                      transition={{ delay: 2.0, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-red-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl group-hover:from-red-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.9, duration: 0.3 }}
                      className="w-3 h-3 bg-red-400 rounded-full animate-pulse"
                    />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors duration-300">
                    {stats?.overdue_tasks || 0}
                  </div>
                  <div className="text-slate-400 font-medium">Просрочено</div>
                  <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats?.overdue_tasks || 0) / Math.max(stats?.total_tasks || 1, 1) * 100, 100)}%` }}
                      transition={{ delay: 2.1, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.button
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.3, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('tasks')}
                className="group relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center space-x-6">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300 shadow-lg"
                  >
                    <BarChart3 className="w-10 h-10 text-blue-400" />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">Все задачи</h3>
                    <p className="text-slate-300 text-base">Управляйте всеми задачами и отслеживайте прогресс</p>
                    <div className="mt-3 flex items-center text-blue-400 text-sm font-medium">
                      <span>Открыть</span>
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                  </div>
                </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('analytics')}
                className="group relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center space-x-6">
                  <motion.div 
                    whileHover={{ rotate: -15, scale: 1.1 }}
                    className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300 shadow-lg"
                  >
                    <BarChart3 className="w-10 h-10 text-purple-400" />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">Аналитика</h3>
                    <p className="text-slate-300 text-base">Статистика, отчеты и аналитика продуктивности</p>
                    <div className="mt-3 flex items-center text-purple-400 text-sm font-medium">
                      <span>Открыть</span>
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      >
                        →
                      </motion.div>
                  </div>
                </div>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTaskModal(true)}
                className="group relative p-8 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center space-x-6">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    className="p-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl group-hover:scale-110 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">Создать задачу</h3>
                    <p className="text-slate-300 text-base">Добавить новую задачу и начать работу</p>
                    <div className="mt-3 flex items-center text-blue-400 text-sm font-medium">
                      <span>Создать</span>
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      >
                        →
                      </motion.div>
                  </div>
                </div>
                </div>
              </motion.button>
            </motion.div>


          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* <AnimatedBackground /> */}
      
      {/* Mobile Navigation */}
      <MobileNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateTask={() => setShowTaskModal(true)}
        isOpen={isMobileMenuOpen}
        onToggle={handleMobileMenuToggle}
      />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onCreateTask={() => setShowTaskModal(true)}
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
              <h2 className="text-xl md:text-2xl font-bold text-white capitalize truncate">
                {currentView === 'dashboard' && 'Дашборд'}
                {currentView === 'tasks' && 'Задачи'}
                {currentView === 'teams' && 'Мои команды'}
                {currentView === 'public-teams' && 'Публичные команды'}
                {currentView === 'collaboration' && 'Команды'}
                {currentView === 'analytics' && 'Аналитика'}
                {currentView === 'calendar' && 'Календарь'}
                {currentView === 'notifications' && 'Уведомления'}
                {currentView === 'settings' && 'Настройки'}
              </h2>
              <p className="text-slate-400 text-xs md:text-sm hidden md:block">
                {currentView === 'dashboard' && 'Обзор вашей продуктивности'}
                {currentView === 'tasks' && 'Управление задачами'}
                {currentView === 'teams' && 'Управление командами и участниками'}
                {currentView === 'public-teams' && 'Найдите и присоединяйтесь к командам других пользователей'}
                {currentView === 'collaboration' && 'Управление командами и проектами'}
                {currentView === 'analytics' && 'Статистика и отчеты по продуктивности'}
                {currentView === 'calendar' && 'Планирование времени'}
                {currentView === 'notifications' && 'Уведомления и напоминания'}
                {currentView === 'settings' && 'Настройки аккаунта'}
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
                onClick={() => setCurrentView('settings')}
                isActive={currentView === 'settings'}
              />
              
              {/* Профиль пользователя */}
              <PremiumUserProfile 
                user={user}
                onLogout={logout}
                onEdit={() => setCurrentView('settings')}
                isActive={false}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4 md:space-y-6 lg:space-y-8">
                {renderContent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* Task Modal */}
      <PremiumTaskModal
        isOpen={showTaskModal}
        onClose={handleCloseModal}
        onSave={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />

      {/* Settings Modals */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onSave={handleProfileSave}
      />

      <SecuritySettingsModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onPasswordChange={handlePasswordChange}
      />

      <NotificationSettingsModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSave={handleNotificationSave}
      />

      <ThemeSettingsModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onSave={handleThemeSave}
      />

      <DataSettingsModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        onExport={handleExport}
        onImport={handleImport}
        onDelete={handleDelete}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* User State Debugger - только в development */}
      <UserStateDebugger />
    </div>
  )
}
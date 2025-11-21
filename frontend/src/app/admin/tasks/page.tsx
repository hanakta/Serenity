'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    email: string
  }
  project?: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  }
}

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400'
      case 'high': return 'bg-orange-500/20 text-orange-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-green-500/20 text-green-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершена'
      case 'cancelled': return 'Отменена'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Срочно'
      case 'high': return 'Высокий'
      case 'medium': return 'Средний'
      case 'low': return 'Низкий'
      default: return priority
    }
  }

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{task.title}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{task.description}</p>
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {getPriorityText(task.priority)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-300">
        {task.user && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Автор:</span>
            <span>{task.user.name || 'Неизвестно'}</span>
          </div>
        )}
        {task.project && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Проект:</span>
            <span>{task.project.name || 'Неизвестно'}</span>
          </div>
        )}
        {task.team && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Команда:</span>
            <span>{task.team.name || 'Неизвестно'}</span>
          </div>
        )}
        {task.due_date && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Срок:</span>
            <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-400' : ''}>
              {new Date(task.due_date).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Создана:</span>
          <span>{new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Ожидает</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Завершена</option>
          <option value="cancelled">Отменена</option>
        </select>
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
        >
          Редактировать
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Удалить
        </button>
      </div>
    </motion.div>
  )
}

const EditTaskModal = ({ task, isOpen, onClose, onSave }: {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: Partial<Task>) => void
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date
      })
    }
  }, [task])

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Редактировать задачу</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Название</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Описание</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Статус</label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершена</option>
                <option value="cancelled">Отменена</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Приоритет</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочно</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Срок выполнения</label>
            <input
              type="datetime-local"
              value={formData.due_date ? new Date(formData.due_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const CreateTaskModal = ({ isOpen, onClose, onCreate, loading }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (taskData: { title: string; description: string; status: string; priority: string; category: string; due_date: string; user_id: string }) => void
  loading: boolean
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'personal',
    due_date: '',
    user_id: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.user_id) {
      onCreate(formData)
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium', category: 'personal', due_date: '', user_id: '' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Создать задачу</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Название</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Ожидает</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Приоритет</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочно</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Категория</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">Личное</option>
              <option value="work">Работа</option>
              <option value="health">Здоровье</option>
              <option value="shopping">Покупки</option>
              <option value="learning">Обучение</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Срок выполнения</label>
            <input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">ID пользователя</label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user_xxx"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminTasks() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchTasks()
    }
  }, [user, token])

  const fetchTasks = async () => {
    try {
      if (!token) {
        console.error('Токен не найден')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:8000/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Для отладки
        const tasksData = data.data?.tasks || data.tasks || []
        setTasks(Array.isArray(tasksData) ? tasksData : [])
      } else {
        console.error('Ошибка загрузки задач:', response.status)
        setTasks([])
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  const handleSave = async (taskData: Partial<Task>) => {
    if (!editingTask) return

    try {
      const response = await fetch(`/api/admin/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        await fetchTasks()
        setShowEditModal(false)
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Ошибка обновления задачи:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return

    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchTasks()
      } else {
        console.error('Ошибка удаления задачи:', response.status)
      }
    } catch (error) {
      console.error('Ошибка удаления задачи:', error)
    }
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchTasks()
      } else {
        console.error('Ошибка изменения статуса задачи:', response.status)
      }
    } catch (error) {
      console.error('Ошибка изменения статуса задачи:', error)
    }
  }

  const handleCreateTask = async (taskData: { title: string; description: string; status: string; priority: string; category: string; due_date: string; user_id: string }) => {
    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      setCreatingTask(true)

      const response = await fetch('http://localhost:8000/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      })

      if (response.ok) {
        await fetchTasks()
        setShowCreateModal(false)
      } else {
        const errorData = await response.json()
        console.error('Ошибка создания задачи:', errorData.message)
        alert('Ошибка создания задачи: ' + errorData.message)
      }
    } catch (error) {
      console.error('Ошибка создания задачи:', error)
      alert('Ошибка создания задачи')
    } finally {
      setCreatingTask(false)
    }
  }

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }) : []

  const getStatusStats = () => {
    const tasksArray = Array.isArray(tasks) ? tasks : []
    const stats = {
      pending: tasksArray.filter(t => t.status === 'pending').length,
      in_progress: tasksArray.filter(t => t.status === 'in_progress').length,
      completed: tasksArray.filter(t => t.status === 'completed').length,
      cancelled: tasksArray.filter(t => t.status === 'cancelled').length
    }
    return stats
  }

  const statusStats = getStatusStats()

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка задач...</div>
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
              <Link href="/admin" className="text-gray-300 hover:text-white">
                ← Назад к админ-панели
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Управление задачами</h1>
                <p className="text-gray-300 text-sm">Всего задач: {tasks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-yellow-400">{statusStats.pending}</div>
            <div className="text-gray-300 text-sm">Ожидают</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{statusStats.in_progress}</div>
            <div className="text-gray-300 text-sm">В работе</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-400">{statusStats.completed}</div>
            <div className="text-gray-300 text-sm">Завершены</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-red-400">{statusStats.cancelled}</div>
            <div className="text-gray-300 text-sm">Отменены</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Поиск</label>
              <input
                type="text"
                placeholder="Поиск по названию, описанию или автору..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидают</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершены</option>
                <option value="cancelled">Отменены</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Приоритет</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все приоритеты</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочно</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Создать задачу</span>
          </button>
        </motion.div>

        {/* Tasks Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </motion.div>

        {filteredTasks.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">Задачи не найдены</h3>
            <p className="text-gray-300">Попробуйте изменить фильтры поиска</p>
          </motion.div>
        )}
      </div>

      <EditTaskModal
        task={editingTask}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTask(null)
        }}
        onSave={handleSave}
      />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
        loading={creatingTask}
      />
    </div>
  )
}


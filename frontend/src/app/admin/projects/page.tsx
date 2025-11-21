'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  owner: {
    id: string
    name: string
    email: string
  }
  team?: {
    id: string
    name: string
  }
  tasks_count: number
  completed_tasks: number
  progress: number
}

const ProjectCard = ({ project, onEdit, onDelete, onStatusChange }: {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onStatusChange: (projectId: string, status: string) => void
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'active': return 'bg-blue-500/20 text-blue-400'
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
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
      case 'planning': return 'Планирование'
      case 'active': return 'Активный'
      case 'on_hold': return 'Приостановлен'
      case 'completed': return 'Завершен'
      case 'cancelled': return 'Отменен'
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
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {getPriorityText(project.priority)}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{project.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Прогресс</span>
          <span className="text-sm text-white font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{project.tasks_count}</div>
          <div className="text-gray-400">Всего задач</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{project.completed_tasks}</div>
          <div className="text-gray-400">Завершено</div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-300">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Владелец:</span>
          <span>{project.owner.name}</span>
        </div>
        {project.team && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Команда:</span>
            <span>{project.team.name}</span>
          </div>
        )}
        {project.start_date && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Начало:</span>
            <span>{new Date(project.start_date).toLocaleDateString('ru-RU')}</span>
          </div>
        )}
        {project.end_date && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Окончание:</span>
            <span className={new Date(project.end_date) < new Date() && project.status !== 'completed' ? 'text-red-400' : ''}>
              {new Date(project.end_date).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Создан:</span>
          <span>{new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <select
          value={project.status}
          onChange={(e) => onStatusChange(project.id, e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="planning">Планирование</option>
          <option value="active">Активный</option>
          <option value="on_hold">Приостановлен</option>
          <option value="completed">Завершен</option>
          <option value="cancelled">Отменен</option>
        </select>
        <button
          onClick={() => onEdit(project)}
          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
        >
          Редактировать
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Удалить
        </button>
      </div>
    </motion.div>
  )
}

const EditProjectModal = ({ project, isOpen, onClose, onSave }: {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSave: (projectData: Partial<Project>) => void
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({})

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date
      })
    }
  }, [project])

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Редактировать проект</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Название</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.status || 'planning'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Планирование</option>
                <option value="active">Активный</option>
                <option value="on_hold">Приостановлен</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Дата начала</label>
              <input
                type="date"
                value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Дата окончания</label>
              <input
                type="date"
                value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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

export default function AdminProjects() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchProjects()
    }
  }, [user, token])

  const fetchProjects = async () => {
    try {
      if (!token) {
        console.error('Токен не найден')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:8000/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Для отладки
        const projectsData = data.data || data.projects || []
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      } else {
        console.error('Ошибка загрузки проектов:', response.status)
        setProjects([])
      }
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleSave = async (projectData: Partial<Project>) => {
    if (!editingProject) return

    try {
      const response = await fetch(`/api/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        await fetchProjects()
        setShowEditModal(false)
        setEditingProject(null)
      }
    } catch (error) {
      console.error('Ошибка обновления проекта:', error)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchProjects()
      }
    } catch (error) {
      console.error('Ошибка удаления проекта:', error)
    }
  }

  const handleStatusChange = async (projectId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchProjects()
      }
    } catch (error) {
      console.error('Ошибка изменения статуса проекта:', error)
    }
  }

  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }) : []

  const getStatusStats = () => {
    const projectsArray = Array.isArray(projects) ? projects : []
    const stats = {
      planning: projectsArray.filter(p => p.status === 'planning').length,
      active: projectsArray.filter(p => p.status === 'active').length,
      on_hold: projectsArray.filter(p => p.status === 'on_hold').length,
      completed: projectsArray.filter(p => p.status === 'completed').length,
      cancelled: projectsArray.filter(p => p.status === 'cancelled').length
    }
    return stats
  }

  const statusStats = getStatusStats()

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка проектов...</div>
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
                <h1 className="text-2xl font-bold text-white">Управление проектами</h1>
                <p className="text-gray-300 text-sm">Всего проектов: {projects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-gray-400">{statusStats.planning}</div>
            <div className="text-gray-300 text-sm">Планирование</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{statusStats.active}</div>
            <div className="text-gray-300 text-sm">Активные</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-yellow-400">{statusStats.on_hold}</div>
            <div className="text-gray-300 text-sm">Приостановлены</div>
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
                placeholder="Поиск по названию, описанию или владельцу..."
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
                <option value="planning">Планирование</option>
                <option value="active">Активные</option>
                <option value="on_hold">Приостановлены</option>
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

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-white mb-2">Проекты не найдены</h3>
            <p className="text-gray-300">Попробуйте изменить фильтры поиска</p>
          </motion.div>
        )}
      </div>

      <EditProjectModal
        project={editingProject}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProject(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}


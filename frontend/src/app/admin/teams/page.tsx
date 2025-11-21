'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Team {
  id: string
  name: string
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
  owner: {
    id: string
    name: string
    email: string
  }
  members_count: number
  tasks_count: number
  projects_count: number
}

const TeamCard = ({ team, onEdit, onDelete, onTogglePublic }: {
  team: Team
  onEdit: (team: Team) => void
  onDelete: (teamId: string) => void
  onTogglePublic: (teamId: string, isPublic: boolean) => void
}) => (
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            team.is_public ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {team.is_public ? 'Публичная' : 'Приватная'}
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-3 line-clamp-3">{team.description}</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
      <div className="text-center">
        <div className="text-lg font-bold text-white">{team.members_count}</div>
        <div className="text-gray-400">Участников</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white">{team.tasks_count}</div>
        <div className="text-gray-400">Задач</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white">{team.projects_count}</div>
        <div className="text-gray-400">Проектов</div>
      </div>
    </div>

    <div className="space-y-2 mb-4 text-sm text-gray-300">
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Владелец:</span>
        <span>{team.owner.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Создана:</span>
        <span>{new Date(team.created_at).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={() => onTogglePublic(team.id, !team.is_public)}
        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
          team.is_public 
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
        }`}
      >
        {team.is_public ? 'Сделать приватной' : 'Сделать публичной'}
      </button>
      <button
        onClick={() => onEdit(team)}
        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
      >
        Редактировать
      </button>
      <button
        onClick={() => onDelete(team.id)}
        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
      >
        Удалить
      </button>
    </div>
  </motion.div>
)

const EditTeamModal = ({ team, isOpen, onClose, onSave }: {
  team: Team | null
  isOpen: boolean
  onClose: () => void
  onSave: (teamData: Partial<Team>) => void
}) => {
  const [formData, setFormData] = useState<Partial<Team>>({})

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description,
        is_public: team.is_public
      })
    }
  }, [team])

  if (!isOpen || !team) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Редактировать команду</h3>
        
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
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public || false}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_public" className="text-gray-300 text-sm">Публичная команда</label>
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

export default function AdminTeams() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchTeams()
    }
  }, [user, token])

  const fetchTeams = async () => {
    try {
      if (!token) {
        console.error('Токен не найден')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:8000/api/admin/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const teamsData = data.data?.teams || data.teams || []
        setTeams(Array.isArray(teamsData) ? teamsData : [])
      } else {
        const errorText = await response.text()
        let errorMessage = `Error loading teams: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If error response is not JSON, use the text as is
        }
        console.error(errorMessage)
        setTeams([])
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setShowEditModal(true)
  }

  const handleSave = async (teamData: Partial<Team>) => {
    if (!editingTeam) return

    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData)
      })

      if (response.ok) {
        await fetchTeams()
        setShowEditModal(false)
        setEditingTeam(null)
      } else {
        console.error('Ошибка обновления команды:', response.status)
      }
    } catch (error) {
      console.error('Ошибка обновления команды:', error)
    }
  }

  const handleDelete = async (teamId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту команду?')) return

    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchTeams()
      } else {
        console.error('Ошибка удаления команды:', response.status)
      }
    } catch (error) {
      console.error('Ошибка удаления команды:', error)
    }
  }

  const handleTogglePublic = async (teamId: string, isPublic: boolean) => {
    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: isPublic })
      })

      if (response.ok) {
        await fetchTeams()
      } else {
        console.error('Ошибка изменения видимости команды:', response.status)
      }
    } catch (error) {
      console.error('Ошибка изменения видимости команды:', error)
    }
  }

  const filteredTeams = Array.isArray(teams) ? teams.filter(team => {
    const matchesSearch = team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVisibility = visibilityFilter === 'all' ||
                             (visibilityFilter === 'public' && team.is_public) ||
                             (visibilityFilter === 'private' && !team.is_public)

    return matchesSearch && matchesVisibility
  }) : []

  const getTeamStats = () => {
    const teamsArray = Array.isArray(teams) ? teams : []
    const stats = {
      total: teamsArray.length,
      public: teamsArray.filter(t => t.is_public).length,
      private: teamsArray.filter(t => !t.is_public).length,
      totalMembers: teamsArray.reduce((sum, team) => sum + team.members_count, 0),
      totalTasks: teamsArray.reduce((sum, team) => sum + team.tasks_count, 0),
      totalProjects: teamsArray.reduce((sum, team) => sum + team.projects_count, 0)
    }
    return stats
  }

  const teamStats = getTeamStats()

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка команд...</div>
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
                <h1 className="text-2xl font-bold text-white">Управление командами</h1>
                <p className="text-gray-300 text-sm">Всего команд: {teams.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-white">{teamStats.total}</div>
            <div className="text-gray-300 text-sm">Всего команд</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-400">{teamStats.public}</div>
            <div className="text-gray-300 text-sm">Публичных</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{teamStats.private}</div>
            <div className="text-gray-300 text-sm">Приватных</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-purple-400">{teamStats.totalMembers}</div>
            <div className="text-gray-300 text-sm">Участников</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-orange-400">{teamStats.totalTasks}</div>
            <div className="text-gray-300 text-sm">Задач</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-indigo-400">{teamStats.totalProjects}</div>
            <div className="text-gray-300 text-sm">Проектов</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-gray-300 text-sm font-medium mb-2">Видимость</label>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все команды</option>
                <option value="public">Публичные</option>
                <option value="private">Приватные</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Teams Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
            />
          ))}
        </motion.div>

        {filteredTeams.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">Команды не найдены</h3>
            <p className="text-gray-300">Попробуйте изменить фильтры поиска</p>
          </motion.div>
        )}
      </div>

      <EditTeamModal
        team={editingTeam}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTeam(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}


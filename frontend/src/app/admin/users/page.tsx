'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  created_at: string
  last_login?: string
  is_active: boolean
}

const UserCard = ({ user, onEdit, onDelete, onToggleStatus }: {
  user: User
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onToggleStatus: (userId: string, isActive: boolean) => void
}) => (
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
          <p className="text-gray-300 text-sm">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.role === 'super_admin' ? 'bg-red-500/20 text-red-400' :
          user.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {user.role === 'super_admin' ? 'Супер-админ' :
           user.role === 'admin' ? 'Админ' : 'Пользователь'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {user.is_active ? 'Активен' : 'Заблокирован'}
        </span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
      <div>
        <span className="text-gray-400">Регистрация:</span>
        <p>{new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
      </div>
      <div>
        <span className="text-gray-400">Последний вход:</span>
        <p>{user.last_login ? new Date(user.last_login).toLocaleDateString('ru-RU') : 'Никогда'}</p>
      </div>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={() => onEdit(user)}
        className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
      >
        Редактировать
      </button>
      <button
        onClick={() => onToggleStatus(user.id, !user.is_active)}
        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
          user.is_active 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
        }`}
      >
        {user.is_active ? 'Заблокировать' : 'Разблокировать'}
      </button>
      <button
        onClick={() => onDelete(user.id)}
        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
      >
        Удалить
      </button>
    </div>
  </motion.div>
)

const EditUserModal = ({ user, isOpen, onClose, onSave }: {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Partial<User>) => void
}) => {
  const [formData, setFormData] = useState<Partial<User>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      })
    }
  }, [user])

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Редактировать пользователя</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Имя</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Роль</label>
            <select
              value={formData.role || 'user'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Пользователь</option>
              <option value="admin">Админ</option>
              <option value="super_admin">Супер-админ</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-gray-300 text-sm">Активный пользователь</label>
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

const CreateUserModal = ({ isOpen, onClose, onCreate, loading }: {
  isOpen: boolean
  onClose: () => void
  onCreate: (userData: { name: string; email: string; password: string; role: string }) => void
  loading: boolean
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.password) {
      onCreate(formData)
      setFormData({ name: '', email: '', password: '', role: 'user' })
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
        <h2 className="text-xl font-bold text-white mb-4">Создать пользователя</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Имя</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Роль</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Пользователь</option>
              <option value="admin">Админ</option>
              <option value="super_admin">Супер-админ</option>
            </select>
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

export default function AdminUsers() {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchUsers()
    }
  }, [user, token])

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token')
      
      if (!token) {
        console.error('Токен не найден')
        setLoading(false)
        return
      }

      console.log('Making request to:', 'http://localhost:8000/api/admin/users')
      
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Для отладки
        const usersData = data.data?.users || data.data || data.users || []
        console.log('Users data:', usersData)
        setUsers(Array.isArray(usersData) ? usersData : [])
      } else {
        const errorText = await response.text()
        console.error('Ошибка загрузки пользователей:', response.status, errorText)
        setUsers([])
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleSave = async (userData: Partial<User>) => {
    if (!editingUser) return

    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        await fetchUsers()
        setShowEditModal(false)
        setEditingUser(null)
      } else {
        console.error('Ошибка обновления пользователя:', response.status)
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        console.error('Ошибка удаления пользователя:', response.status)
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
    }
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive })
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        console.error('Ошибка изменения статуса пользователя:', response.status)
      }
    } catch (error) {
      console.error('Ошибка изменения статуса пользователя:', error)
    }
  }

  const handleCreateUser = async (userData: { name: string; email: string; password: string; role: string }) => {
    try {
      if (!token) {
        console.error('Токен не найден')
        return
      }

      setCreatingUser(true)

      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        await fetchUsers()
        setShowCreateModal(false)
      } else {
        const errorData = await response.json()
        console.error('Ошибка создания пользователя:', errorData.message)
        alert('Ошибка создания пользователя: ' + errorData.message)
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
      alert('Ошибка создания пользователя')
    } finally {
      setCreatingUser(false)
    }
  }

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  }) : []

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка пользователей...</div>
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
                <h1 className="text-2xl font-bold text-white">Управление пользователями</h1>
                <p className="text-gray-300 text-sm">Всего пользователей: {users.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Поиск</label>
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Роль</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все роли</option>
                <option value="user">Пользователь</option>
                <option value="admin">Админ</option>
                <option value="super_admin">Супер-админ</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Заблокированные</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Создать пользователя</span>
          </button>
        </motion.div>

        {/* Users Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </motion.div>

        {filteredUsers.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">Пользователи не найдены</h3>
            <p className="text-gray-300">Попробуйте изменить фильтры поиска</p>
          </motion.div>
        )}
      </div>

      <EditUserModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingUser(null)
        }}
        onSave={handleSave}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
        loading={creatingUser}
      />
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface SystemSettings {
  general: {
    site_name: string
    site_description: string
    site_url: string
    admin_email: string
    timezone: string
    language: string
  }
  features: {
    user_registration: boolean
    team_collaboration: boolean
    file_sharing: boolean
    notifications: boolean
    analytics: boolean
  }
  security: {
    password_min_length: number
    require_email_verification: boolean
    session_timeout: number
    max_login_attempts: number
    enable_2fa: boolean
  }
  email: {
    smtp_host: string
    smtp_port: number
    smtp_username: string
    smtp_password: string
    from_email: string
    from_name: string
  }
  storage: {
    max_file_size: number
    allowed_file_types: string[]
    storage_path: string
  }
}

const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    {children}
  </motion.div>
)

const SettingField = ({ label, children, description }: { 
  label: string, 
  children: React.ReactNode, 
  description?: string 
}) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
    {children}
    {description && <p className="text-gray-400 text-xs mt-1">{description}</p>}
  </div>
)

export default function AdminSettings() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.data || getDefaultSettings())
      } else {
        setSettings(getDefaultSettings())
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      setSettings(getDefaultSettings())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSettings = (): SystemSettings => ({
    general: {
      site_name: 'Serenity',
      site_description: 'Система управления задачами',
      site_url: 'http://localhost:3000',
      admin_email: 'admin@serenity.com',
      timezone: 'Europe/Moscow',
      language: 'ru'
    },
    features: {
      user_registration: true,
      team_collaboration: true,
      file_sharing: true,
      notifications: true,
      analytics: true
    },
    security: {
      password_min_length: 8,
      require_email_verification: false,
      session_timeout: 24,
      max_login_attempts: 5,
      enable_2fa: false
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      from_email: 'noreply@serenity.com',
      from_name: 'Serenity'
    },
    storage: {
      max_file_size: 10,
      allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      storage_path: '/uploads'
    }
  })

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Настройки сохранены успешно!')
      } else {
        alert('Ошибка сохранения настроек')
      }
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error)
      alert('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    })
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка настроек...</div>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null
  }

  if (!settings) return null

  const tabs = [
    { id: 'general', label: 'Общие', icon: '⚙️' },
    { id: 'features', label: 'Функции', icon: '🚀' },
    { id: 'security', label: 'Безопасность', icon: '🔒' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'storage', label: 'Хранилище', icon: '💾' }
  ]

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
                <h1 className="text-2xl font-bold text-white">Системные настройки</h1>
                <p className="text-gray-300 text-sm">Конфигурация системы и параметров</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <motion.div
          className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-lg rounded-xl p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <SettingSection title="Общие настройки">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField label="Название сайта" description="Отображается в заголовке и уведомлениях">
                <input
                  type="text"
                  value={settings.general.site_name}
                  onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="URL сайта" description="Основной URL вашего сайта">
                <input
                  type="url"
                  value={settings.general.site_url}
                  onChange={(e) => updateSetting('general', 'site_url', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Email администратора" description="Для получения уведомлений">
                <input
                  type="email"
                  value={settings.general.admin_email}
                  onChange={(e) => updateSetting('general', 'admin_email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Часовой пояс" description="Используется для отображения времени">
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/London">Лондон (UTC+0)</option>
                  <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                  <option value="Asia/Tokyo">Токио (UTC+9)</option>
                </select>
              </SettingField>
            </div>
            
            <SettingField label="Описание сайта" description="Краткое описание для поисковых систем">
              <textarea
                value={settings.general.site_description}
                onChange={(e) => updateSetting('general', 'site_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </SettingField>
          </SettingSection>
        )}

        {/* Features Settings */}
        {activeTab === 'features' && (
          <SettingSection title="Функции системы">
            <div className="space-y-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-300 font-medium">
                      {key === 'user_registration' && 'Регистрация пользователей'}
                      {key === 'team_collaboration' && 'Командная работа'}
                      {key === 'file_sharing' && 'Обмен файлами'}
                      {key === 'notifications' && 'Уведомления'}
                      {key === 'analytics' && 'Аналитика'}
                    </label>
                    <p className="text-gray-400 text-sm">
                      {key === 'user_registration' && 'Разрешить новым пользователям регистрироваться'}
                      {key === 'team_collaboration' && 'Включить функции командной работы'}
                      {key === 'file_sharing' && 'Разрешить загрузку и обмен файлами'}
                      {key === 'notifications' && 'Отправлять уведомления пользователям'}
                      {key === 'analytics' && 'Собирать аналитические данные'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSetting('features', key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </SettingSection>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <SettingSection title="Настройки безопасности">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField label="Минимальная длина пароля" description="Минимум символов в пароле">
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={settings.security.password_min_length}
                  onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Таймаут сессии (часы)" description="Время неактивности до автоматического выхода">
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.security.session_timeout}
                  onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Максимум попыток входа" description="Количество неудачных попыток до блокировки">
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.max_login_attempts}
                  onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 font-medium">Требовать подтверждение email</label>
                  <p className="text-gray-400 text-sm">Пользователи должны подтвердить email перед использованием</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.require_email_verification}
                  onChange={(e) => updateSetting('security', 'require_email_verification', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 font-medium">Двухфакторная аутентификация</label>
                  <p className="text-gray-400 text-sm">Дополнительная защита аккаунтов</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.enable_2fa}
                  onChange={(e) => updateSetting('security', 'enable_2fa', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </SettingSection>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <SettingSection title="Настройки email">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField label="SMTP сервер" description="Адрес почтового сервера">
                <input
                  type="text"
                  value={settings.email.smtp_host}
                  onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="SMTP порт" description="Порт для подключения к серверу">
                <input
                  type="number"
                  value={settings.email.smtp_port}
                  onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Имя пользователя" description="Логин для SMTP сервера">
                <input
                  type="text"
                  value={settings.email.smtp_username}
                  onChange={(e) => updateSetting('email', 'smtp_username', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Пароль" description="Пароль для SMTP сервера">
                <input
                  type="password"
                  value={settings.email.smtp_password}
                  onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Email отправителя" description="Адрес для отправки писем">
                <input
                  type="email"
                  value={settings.email.from_email}
                  onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Имя отправителя" description="Имя для писем">
                <input
                  type="text"
                  value={settings.email.from_name}
                  onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
            </div>
          </SettingSection>
        )}

        {/* Storage Settings */}
        {activeTab === 'storage' && (
          <SettingSection title="Настройки хранилища">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField label="Максимальный размер файла (МБ)" description="Ограничение размера загружаемых файлов">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.storage.max_file_size}
                  onChange={(e) => updateSetting('storage', 'max_file_size', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
              
              <SettingField label="Путь к хранилищу" description="Директория для сохранения файлов">
                <input
                  type="text"
                  value={settings.storage.storage_path}
                  onChange={(e) => updateSetting('storage', 'storage_path', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </SettingField>
            </div>
            
            <SettingField label="Разрешенные типы файлов" description="Расширения файлов, которые можно загружать">
              <div className="flex flex-wrap gap-2">
                {settings.storage.allowed_file_types.map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                  >
                    .{type}
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Добавить новый тип (например: mp4)"
                className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newType = e.currentTarget.value.trim().toLowerCase()
                    if (newType && !settings.storage.allowed_file_types.includes(newType)) {
                      updateSetting('storage', 'allowed_file_types', [...settings.storage.allowed_file_types, newType])
                      e.currentTarget.value = ''
                    }
                  }
                }}
              />
            </SettingField>
          </SettingSection>
        )}
      </div>
    </div>
  )
}


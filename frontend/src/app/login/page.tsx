'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import AuthTabSwitcher from '@/components/auth/AuthTabSwitcher'
import { 
  Sparkles,
  Menu
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const { user, login, register } = useAuth()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        router.push('/')
      }, 100)
    }
  }, [user, router])

  useEffect(() => {
    const savedFormData = localStorage.getItem('loginFormData')
    if (savedFormData) {
      const parsed = JSON.parse(savedFormData)
      setEmail(parsed.email || '')
      setPassword(parsed.password || '')
      setName(parsed.name || '')
      setFormData(parsed)
    }
  }, [])

  useEffect(() => {
    const formData = { email, password, name }
    localStorage.setItem('loginFormData', JSON.stringify(formData))
    setFormData(formData)
  }, [email, password, name])

  const clearSavedData = () => {
    localStorage.removeItem('loginFormData')
    setFormData({ email: '', password: '', name: '' })
  }

  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple') => {
    console.log(`Вход через ${provider} — заглушка`)
  }

  const handleForgotPassword = () => {
    console.log('Восстановление пароля — заглушка')
  }

  const handleEnable2FA = () => {
    console.log('Включение 2FA — заглушка')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      clearSavedData()
    } catch (err: any) {
      setError(err.message || 'Ошибка входа')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await register(name, email, password)
      clearSavedData()
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: 'email' | 'password' | 'name', value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)
    if (field === 'name') setName(value)
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Навигационная панель (простая) */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">Serenity</span>
          </motion.div>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Хиро-секция */}
      <section className="relative z-10 min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Левая часть */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <motion.h1
                  className="text-6xl font-extrabold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Премиум
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Менеджер Задач
                  </span>
                </motion.h1>
                <motion.p
                  className="text-xl text-slate-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Революционный инструмент для управления задачами с искусственным интеллектом,
                  красивым дизайном и мощными возможностями для повышения продуктивности.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <button 
                  onClick={() => setShowRegister(true)}
                  className="btn-primary px-8 py-4 text-lg shadow-glow"
                >
                  <Sparkles className="w-5 h-5 mr-2 inline" />
                  Начать бесплатно
                </button>
              </motion.div>
            </motion.div>

            {/* Правая часть - форма */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative max-w-md mx-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-large p-8">
                <AuthTabSwitcher 
                  showRegister={showRegister} 
                  onToggle={setShowRegister} 
                />

                {!showRegister ? (
                  <LoginForm
                    email={email}
                    password={password}
                    showPassword={showPassword}
                    rememberMe={rememberMe}
                    isLoading={isLoading}
                    error={error}
                    onEmailChange={(email) => handleInputChange('email', email)}
                    onPasswordChange={(password) => handleInputChange('password', password)}
                    onShowPasswordToggle={() => setShowPassword(!showPassword)}
                    onRememberMeChange={setRememberMe}
                    onSubmit={handleLogin}
                    onForgotPassword={handleForgotPassword}
                    onSocialLogin={handleSocialLogin}
                    onEnable2FA={handleEnable2FA}
                  />
                ) : (
                  <RegisterForm
                    name={name}
                    email={email}
                    password={password}
                    showPassword={showPassword}
                    isLoading={isLoading}
                    error={error}
                    onNameChange={(name) => handleInputChange('name', name)}
                    onEmailChange={(email) => handleInputChange('email', email)}
                    onPasswordChange={(password) => handleInputChange('password', password)}
                    onShowPasswordToggle={() => setShowPassword(!showPassword)}
                    onSubmit={handleRegister}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
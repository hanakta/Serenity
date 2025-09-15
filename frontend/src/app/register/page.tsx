'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const Particle = () => {
  const size = Math.random() * 5 + 5
  const duration = Math.random() * 10 + 10
  const delay = Math.random() * 5
  const x = Math.random() * 100
  const y = Math.random() * 100

  return (
    <motion.div
      className="absolute bg-white rounded-full opacity-20"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, Math.random() * 20 - 10, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: 'easeOut',
        delay: delay,
      }}
    />
  )
}

const BenefitCard = ({ icon, title, description, delay }: { icon: string, title: string, description: string, delay: number }) => (
  <motion.div
    className="card-hover p-6 text-center"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </motion.div>
)

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register, isLoading: authLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  if (authLoading) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      setIsLoading(false)
      return
    }
    
    try {
      await register(name, email, password, confirmPassword)
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: '🚀',
      title: 'Быстрый старт',
      description: 'Начните работу за 30 секунд без сложной настройки'
    },
    {
      icon: '💎',
      title: 'Премиум функции',
      description: 'Доступ ко всем возможностям без ограничений'
    },
    {
      icon: '🔐',
      title: 'Безопасность',
      description: 'Ваши данные защищены современными технологиями'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Анимированные частицы */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Particle key={i} />
      ))}

      {/* Навигационная панель */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">Serenity</span>
          </motion.div>

          <motion.div
            className="flex space-x-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {['Возможности', 'Цены', 'О нас', 'Поддержка'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                {item}
              </a>
            ))}
          </motion.div>

          <motion.div
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button 
              onClick={() => router.push('/login')}
              className="btn-ghost px-6 py-2"
            >
              Войти
            </button>
            <button className="btn-primary px-6 py-2">Начать бесплатно</button>
          </motion.div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Левая часть - Информация о регистрации */}
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
                Присоединяйтесь к
                <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Serenity
                </span>
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Создайте аккаунт и получите доступ к мощным инструментам 
                для управления задачами, которые помогут вам достичь большего.
              </motion.p>
            </div>

            {/* Преимущества */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{benefit.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Статистика */}
            <motion.div
              className="grid grid-cols-3 gap-8 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-gray-400 text-sm">Пользователей</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1M+</div>
                <div className="text-gray-400 text-sm">Задач создано</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-gray-400 text-sm">Время работы</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Правая часть - Форма регистрации */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="card max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Создать аккаунт</h2>
                <p className="text-gray-400">Заполните форму для регистрации</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <div className="flex items-center space-x-3 text-red-400">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">
                    Полное имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                    Email адрес
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                    Пароль
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="input"
                    placeholder="Минимум 8 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-medium mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="input"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Создание аккаунта...</span>
                    </div>
                  ) : (
                    'Создать аккаунт'
                  )}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  Уже есть аккаунт?{' '}
                  <motion.a
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Войти
                  </motion.a>
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs">
                  Создавая аккаунт, вы соглашаетесь с нашими{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    условиями использования
                  </a>{' '}
                  и{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    политикой конфиденциальности
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
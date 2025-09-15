'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Heart, Github, Mail, ExternalLink, Star, Users, Code, Zap, Download, Info, Shield, Clock, Award, Sparkles, ChevronRight, X } from 'lucide-react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [currentVersion, setCurrentVersion] = useState('1.0.0')
  const [buildDate, setBuildDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setBuildDate(new Date().toLocaleDateString('ru-RU'))
    }
  }, [isOpen])

  const features = [
    {
      icon: Zap,
      title: 'Мгновенная синхронизация',
      description: 'Ваши данные синхронизируются в реальном времени',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Командная работа',
      description: 'Совместная работа над проектами и задачами',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code,
      title: 'Открытый исходный код',
      description: 'Полностью открытый и прозрачный код',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Star,
      title: 'Премиум функции',
      description: 'Расширенные возможности для продуктивности',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Защита ваших данных и конфиденциальности',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: Clock,
      title: 'Умные уведомления',
      description: 'Интеллектуальная система напоминаний',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  const team = [
    {
      name: 'Serenity Team',
      role: 'Команда разработчиков',
      description: 'Создаем будущее управления задачами с любовью и профессионализмом',
      avatar: '👨‍💻',
      social: {
        github: 'https://github.com/serenity-team',
        email: 'team@serenity.app'
      }
    }
  ]

  const technologies = [
    { name: 'Next.js 15', description: 'React фреймворк', icon: '⚛️' },
    { name: 'React 19', description: 'UI библиотека', icon: '⚡' },
    { name: 'TypeScript', description: 'Типизированный JS', icon: '🔷' },
    { name: 'Tailwind CSS', description: 'CSS фреймворк', icon: '🎨' },
    { name: 'Framer Motion', description: 'Анимации', icon: '🎬' },
    { name: 'Radix UI', description: 'UI компоненты', icon: '🧩' },
    { name: 'PHP 8+', description: 'Backend язык', icon: '🐘' },
    { name: 'SQLite', description: 'База данных', icon: '🗄️' }
  ]

  const stats = [
    { label: 'Пользователей', value: '10K+', icon: Users },
    { label: 'Задач создано', value: '1M+', icon: Star },
    { label: 'Время работы', value: '99.9%', icon: Clock },
    { label: 'Удовлетворенность', value: '4.9/5', icon: Heart }
  ]

  const handleDownload = async () => {
    setIsLoading(true)
    // Симуляция загрузки
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    // Здесь можно добавить реальную логику загрузки
    console.log('Загрузка приложения...')
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-glow overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-slate-700/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
                  "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
                  "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">О Serenity</h2>
                  <p className="text-slate-400">Современный менеджер задач для максимальной продуктивности</p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-8">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center py-8"
              >
                <motion.div
                  className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  animate={{ 
                    boxShadow: [
                      "0 20px 40px rgba(59, 130, 246, 0.3)",
                      "0 20px 40px rgba(147, 51, 234, 0.3)",
                      "0 20px 40px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-white font-bold text-5xl">S</span>
                </motion.div>
                
                <motion.h2
                  className="text-3xl font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Serenity v{currentVersion}
                </motion.h2>
                
                <motion.p
                  className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Премиум менеджер задач, созданный с любовью для повышения вашей продуктивности. 
                  Управляйте задачами, отслеживайте прогресс и достигайте целей с легкостью.
                </motion.p>

                <motion.div
                  className="flex items-center justify-center space-x-4 mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Скачать приложение</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleExternalLink('https://github.com/serenity-team')}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30 text-center"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Основные возможности
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="h-full bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group-hover:shadow-xl">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl`}>
                              <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                              {feature.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-slate-300 leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Team */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Наша команда
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {team.map((member, index) => (
                    <motion.div
                      key={index}
                      className="group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Card className="text-center bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group-hover:shadow-xl">
                        <CardHeader>
                          <motion.div
                            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            {member.avatar}
                          </motion.div>
                          <CardTitle className="text-2xl text-white">{member.name}</CardTitle>
                          <CardDescription className="text-blue-400 font-medium text-lg">
                            {member.role}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300 mb-4">{member.description}</p>
                          <div className="flex justify-center space-x-4">
                            <motion.button
                              onClick={() => handleExternalLink(member.social.github)}
                              className="p-2 bg-slate-600/50 hover:bg-slate-500/50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Github className="w-5 h-5 text-slate-300" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleExternalLink(`mailto:${member.social.email}`)}
                              className="p-2 bg-slate-600/50 hover:bg-slate-500/50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Mail className="w-5 h-5 text-slate-300" />
                            </motion.button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Technology Stack */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Технологии
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {technologies.map((tech, index) => (
                    <motion.div
                      key={index}
                      className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30 text-center hover:border-slate-500/50 transition-all duration-300 group cursor-pointer"
                      whileHover={{ scale: 1.05, y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                    >
                      <div className="text-3xl mb-2">{tech.icon}</div>
                      <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {tech.name}
                      </div>
                      <div className="text-sm text-slate-400">{tech.description}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="border-t border-slate-700/50 pt-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Полезные ссылки
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    onClick={() => handleExternalLink('https://github.com/serenity-team')}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Github className="h-5 w-5" />
                    <span>GitHub</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleExternalLink('mailto:support@serenity.app')}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="h-5 w-5" />
                    <span>Поддержка</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleExternalLink('https://docs.serenity.app')}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Документация</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-center py-6 border-t border-slate-700/50"
              >
                <motion.p
                  className="text-slate-400 mb-2 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <span>Создано с</span>
                  <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                  <span>командой Serenity</span>
                </motion.p>
                <p className="text-sm text-slate-500">
                  © 2024 Serenity. Все права защищены. | Версия {currentVersion} | Сборка {buildDate}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons - зафиксированы внизу */}
          <div className="border-t border-slate-700/50 p-6 bg-slate-800/50">
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Закрыть</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
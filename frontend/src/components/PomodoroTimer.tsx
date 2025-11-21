'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Target, 
  Coffee, 
  Clock, 
  CheckCircle,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Task } from '@/lib/utils'
import { usePomodoro } from '@/hooks/usePomodoro'

interface PomodoroSettings {
  focusTime: number // в минутах
  shortBreak: number // в минутах
  longBreak: number // в минутах
  longBreakInterval: number // количество pomodoro до длинного перерыва
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
}

interface PomodoroSession {
  id: string
  taskId?: string
  taskTitle?: string
  startTime: Date
  endTime?: Date
  duration: number
  type: 'focus' | 'shortBreak' | 'longBreak'
  completed: boolean
}

interface PomodoroTimerProps {
  tasks: Task[]
  onSessionComplete?: (session: PomodoroSession) => void
}

const defaultSettings: PomodoroSettings = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  desktopNotifications: true
}

export default function PomodoroTimer({ tasks, onSessionComplete }: PomodoroTimerProps) {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentSession, setCurrentSession] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60) // в секундах
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Используем хук для работы с API
  const { 
    sessions, 
    stats, 
    createSession, 
    fetchSessions, 
    fetchStats, 
    loading, 
    error 
  } = usePomodoro()

  // Инициализация аудио (используем встроенные звуки браузера)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Создаем простой звук с помощью Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }, [])

  // Загрузка настроек из localStorage и запрос разрешений
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Запрашиваем разрешение на уведомления
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Сохранение настроек в localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
  }, [settings])

  // Обновление времени при изменении настроек
  useEffect(() => {
    if (!isRunning) {
      const timeInSeconds = currentSession === 'focus' 
        ? settings.focusTime * 60
        : currentSession === 'shortBreak'
        ? settings.shortBreak * 60
        : settings.longBreak * 60
      setTimeLeft(timeInSeconds)
    }
  }, [settings, currentSession, isRunning])

  // Основной таймер
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete().catch(console.error)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = async () => {
    setIsRunning(false)
    setIsPaused(false)
    
    // Создаем сессию
    const now = new Date()
    const sessionDuration = currentSession === 'focus' ? settings.focusTime : currentSession === 'shortBreak' ? settings.shortBreak : settings.longBreak
    const session: PomodoroSession = {
      id: `session_${now.getTime()}_${Math.floor(Math.random() * 1000)}`,
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title,
      startTime: new Date(now.getTime() - sessionDuration * 60 * 1000),
      endTime: now,
      duration: sessionDuration,
      type: currentSession,
      completed: true
    }

    // Сохраняем сессию в API
    try {
      await createSession({
        taskId: session.taskId,
        taskTitle: session.taskTitle,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString() || new Date().toISOString(),
        duration: session.duration,
        type: session.type,
        completed: session.completed
      })
    } catch (error) {
      console.error('Ошибка сохранения сессии:', error)
    }

    onSessionComplete?.(session)

    // Воспроизводим звук
    if (settings.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.error('Error playing sound:', error)
      }
    }

    // Показываем уведомление
    if (settings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(
          currentSession === 'focus' ? 'Время концентрации закончилось!' : 'Перерыв закончился!',
          {
            body: currentSession === 'focus' 
              ? 'Время для перерыва. Отдохните немного!' 
              : 'Время возвращаться к работе!',
            icon: '/favicon.ico'
          }
        )
      }
    }

    // Обновляем счетчик pomodoro
    if (currentSession === 'focus') {
      setCompletedPomodoros(prev => prev + 1)
    }

    // Переходим к следующей сессии
    if (currentSession === 'focus') {
      const shouldTakeLongBreak = (completedPomodoros + 1) % settings.longBreakInterval === 0
      setCurrentSession(shouldTakeLongBreak ? 'longBreak' : 'shortBreak')
    } else {
      setCurrentSession('focus')
    }

    // Автозапуск следующей сессии
    if (currentSession === 'focus' && settings.autoStartBreaks) {
      setTimeout(() => {
        startTimer()
      }, 2000)
    } else if (currentSession !== 'focus' && settings.autoStartPomodoros) {
      setTimeout(() => {
        startTimer()
      }, 2000)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
    setIsPaused(true)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    const timeInSeconds = currentSession === 'focus' 
      ? settings.focusTime * 60
      : currentSession === 'shortBreak'
      ? settings.shortBreak * 60
      : settings.longBreak * 60
    setTimeLeft(timeInSeconds)
  }

  const switchSession = (sessionType: 'focus' | 'shortBreak' | 'longBreak') => {
    if (isRunning) {
      pauseTimer()
    }
    setCurrentSession(sessionType)
    const timeInSeconds = sessionType === 'focus' 
      ? settings.focusTime * 60
      : sessionType === 'shortBreak'
      ? settings.shortBreak * 60
      : settings.longBreak * 60
    setTimeLeft(timeInSeconds)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalTime = currentSession === 'focus' 
      ? settings.focusTime * 60
      : currentSession === 'shortBreak'
      ? settings.shortBreak * 60
      : settings.longBreak * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const getSessionColor = () => {
    switch (currentSession) {
      case 'focus':
        return 'from-red-500 to-pink-500'
      case 'shortBreak':
        return 'from-green-500 to-emerald-500'
      case 'longBreak':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'focus':
        return <Target className="w-8 h-8" />
      case 'shortBreak':
        return <Coffee className="w-8 h-8" />
      case 'longBreak':
        return <Coffee className="w-8 h-8" />
      default:
        return <Clock className="w-8 h-8" />
    }
  }

  const getSessionTitle = () => {
    switch (currentSession) {
      case 'focus':
        return 'Концентрация'
      case 'shortBreak':
        return 'Короткий перерыв'
      case 'longBreak':
        return 'Длинный перерыв'
      default:
        return 'Таймер'
    }
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
          Pomodoro Таймер
        </h2>
        <p className="text-xl text-slate-300">
          Сосредоточьтесь на работе с техникой Pomodoro
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основной таймер */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl shadow-2xl">
            {/* Выбор задачи */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Выберите задачу для работы
              </label>
              <select
                value={selectedTask?.id || ''}
                onChange={(e) => {
                  const task = tasks.find(t => t.id === e.target.value)
                  setSelectedTask(task || null)
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              >
                <option value="">Выберите задачу...</option>
                {tasks.filter(task => task.status !== 'completed').map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Текущая сессия */}
            <div className="text-center mb-8">
              <motion.div
                key={currentSession}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-3 mb-4"
              >
                <div className={`p-3 bg-gradient-to-r ${getSessionColor()} rounded-2xl`}>
                  {getSessionIcon()}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {getSessionTitle()}
                </h3>
              </motion.div>

              {selectedTask && (
                <p className="text-slate-400 mb-4">
                  Работаем над: <span className="text-white font-medium">{selectedTask.title}</span>
                </p>
              )}
            </div>

            {/* Круглый таймер */}
            <div className="relative w-80 h-80 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Фоновый круг */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-slate-700"
                />
                {/* Прогресс */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  className={`text-transparent bg-gradient-to-r ${getSessionColor()} bg-clip-text`}
                  style={{
                    stroke: currentSession === 'focus' ? '#ef4444' : currentSession === 'shortBreak' ? '#10b981' : '#3b82f6'
                  }}
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - getProgress() / 100) }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>
              
              {/* Время в центре */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl font-bold text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {currentSession === 'focus' ? 'минут концентрации' : 'минут отдыха'}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Кнопки управления */}
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                onClick={isRunning ? pauseTimer : startTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isRunning 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>

              <motion.button
                onClick={resetTimer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Square className="w-6 h-6" />
              </motion.button>

              <motion.button
                onClick={() => setShowSettings(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Боковая панель */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Выбор типа сессии */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Тип сессии</h3>
            <div className="space-y-3">
              {[
                { type: 'focus' as const, label: 'Концентрация', icon: Target, color: 'from-red-500 to-pink-500' },
                { type: 'shortBreak' as const, label: 'Короткий перерыв', icon: Coffee, color: 'from-green-500 to-emerald-500' },
                { type: 'longBreak' as const, label: 'Длинный перерыв', icon: Coffee, color: 'from-blue-500 to-cyan-500' }
              ].map(({ type, label, icon: Icon, color }) => (
                <motion.button
                  key={type}
                  onClick={() => switchSession(type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 rounded-xl transition-all duration-300 ${
                    currentSession === type
                      ? `bg-gradient-to-r ${color} text-white shadow-lg`
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>


          {/* Быстрые настройки */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Быстрые настройки</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Звук</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.soundEnabled 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Уведомления</span>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, desktopNotifications: !prev.desktopNotifications }))}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.desktopNotifications 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Модальное окно настроек */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Настройки таймера</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Время концентрации (минуты)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.focusTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, focusTime: parseInt(e.target.value) || 25 }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Короткий перерыв (минуты)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreak}
                    onChange={(e) => setSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Длинный перерыв (минуты)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreak}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Интервал длинного перерыва
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-300">Автозапуск перерывов</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartPomodoros: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-slate-300">Автозапуск Pomodoro</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <motion.button
                  onClick={() => setShowSettings(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Отмена
                </motion.button>
                <motion.button
                  onClick={() => setShowSettings(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300"
                >
                  Сохранить
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

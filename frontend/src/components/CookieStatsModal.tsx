'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, TrendingUp, Users, Calendar, Cookie } from 'lucide-react'

interface CookieStats {
  date: string
  total_consents: number
  accepted_count: number
  declined_count: number
}

interface CookieStatsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CookieStatsModal({ isOpen, onClose }: CookieStatsModalProps) {
  const [stats, setStats] = useState<CookieStats[]>([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState(30)

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cookies/stats?days=${period}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadStats()
    }
  }, [isOpen, period])

  const totalConsents = stats.reduce((sum, stat) => sum + stat.total_consents, 0)
  const totalAccepted = stats.reduce((sum, stat) => sum + stat.accepted_count, 0)
  const totalDeclined = stats.reduce((sum, stat) => sum + stat.declined_count, 0)
  const acceptanceRate = totalConsents > 0 ? Math.round((totalAccepted / totalConsents) * 100) : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Статистика Cookies</h2>
                  <p className="text-sm text-gray-400">Анализ согласий пользователей</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-300">Период:</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7 дней</option>
                  <option value={30}>30 дней</option>
                  <option value={90}>90 дней</option>
                  <option value={365}>1 год</option>
                </select>
                <button
                  onClick={loadStats}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
                >
                  {loading ? 'Загрузка...' : 'Обновить'}
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-200" />
                    <div>
                      <p className="text-blue-200 text-sm">Всего согласий</p>
                      <p className="text-white text-2xl font-bold">{totalConsents}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Cookie className="w-6 h-6 text-green-200" />
                    <div>
                      <p className="text-green-200 text-sm">Принято</p>
                      <p className="text-white text-2xl font-bold">{totalAccepted}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <X className="w-6 h-6 text-red-200" />
                    <div>
                      <p className="text-red-200 text-sm">Отклонено</p>
                      <p className="text-white text-2xl font-bold">{totalDeclined}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-200" />
                    <div>
                      <p className="text-purple-200 text-sm">Процент принятия</p>
                      <p className="text-white text-2xl font-bold">{acceptanceRate}%</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Daily Stats Table */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Ежедневная статистика
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-left p-4 text-gray-300 font-medium">Дата</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Всего</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Принято</th>
                        <th className="text-left p-4 text-gray-300 font-medium">Отклонено</th>
                        <th className="text-left p-4 text-gray-300 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat, index) => {
                        const dayAcceptanceRate = stat.total_consents > 0 
                          ? Math.round((stat.accepted_count / stat.total_consents) * 100) 
                          : 0
                        
                        return (
                          <motion.tr
                            key={stat.date}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                          >
                            <td className="p-4 text-white">{stat.date}</td>
                            <td className="p-4 text-gray-300">{stat.total_consents}</td>
                            <td className="p-4 text-green-400">{stat.accepted_count}</td>
                            <td className="p-4 text-red-400">{stat.declined_count}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                                    style={{ width: `${dayAcceptanceRate}%` }}
                                  />
                                </div>
                                <span className="text-gray-300 text-sm">{dayAcceptanceRate}%</span>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}




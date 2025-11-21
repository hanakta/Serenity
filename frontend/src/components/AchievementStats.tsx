'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  TrendingUp,
  Award,
  Crown,
  Medal
} from 'lucide-react'
import AchievementBadge, { Achievement } from './AchievementBadge'

interface AchievementStatsProps {
  achievements: Achievement[]
  totalPoints: number
  level: number
  className?: string
}

const AchievementStats = memo(function AchievementStats({
  achievements,
  totalPoints,
  level,
  className = ''
}: AchievementStatsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const unlocked = achievements.filter(a => a.unlockedAt)
    const locked = achievements.filter(a => !a.unlockedAt)
    setUnlockedAchievements(unlocked)
    setLockedAchievements(locked)
  }, [achievements])

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true
    return achievement.rarity === selectedCategory
  })

  const getCategoryStats = () => {
    const stats = {
      all: { unlocked: 0, total: 0, points: 0 },
      common: { unlocked: 0, total: 0, points: 0 },
      rare: { unlocked: 0, total: 0, points: 0 },
      epic: { unlocked: 0, total: 0, points: 0 },
      legendary: { unlocked: 0, total: 0, points: 0 }
    }

    achievements.forEach(achievement => {
      const isUnlocked = !!achievement.unlockedAt
      stats.all.total++
      stats[achievement.rarity].total++
      
      if (isUnlocked) {
        stats.all.unlocked++
        stats[achievement.rarity].unlocked++
        stats.all.points += achievement.points
        stats[achievement.rarity].points += achievement.points
      }
    })

    return stats
  }

  const categoryStats = getCategoryStats()

  const categories = [
    { id: 'all', label: 'Все', icon: Trophy, color: 'text-slate-400' },
    { id: 'common', label: 'Обычные', icon: Star, color: 'text-slate-400' },
    { id: 'rare', label: 'Редкие', icon: Target, color: 'text-blue-400' },
    { id: 'epic', label: 'Эпические', icon: Zap, color: 'text-purple-400' },
    { id: 'legendary', label: 'Легендарные', icon: Crown, color: 'text-yellow-400' }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Level */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Уровень</p>
              <p className="text-2xl font-bold text-white">{level}</p>
            </div>
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Очки</p>
              <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Achievements Unlocked */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
              <Medal className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Достижения</p>
              <p className="text-2xl font-bold text-white">
                {unlockedAchievements.length}/{achievements.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => {
          const Icon = category.icon
          const stats = categoryStats[category.id as keyof typeof categoryStats]
          const isSelected = selectedCategory === category.id
          
          return (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white' 
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : category.color}`} />
              <span className="text-sm font-medium">{category.label}</span>
              <span className="text-xs text-slate-500">
                ({stats.unlocked}/{stats.total})
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <AnimatePresence mode="wait">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementBadge
                achievement={achievement}
                isUnlocked={!!achievement.unlockedAt}
                showProgress={!achievement.unlockedAt}
                size="md"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Прогресс по категориям</h3>
        <div className="space-y-3">
          {categories.slice(1).map((category, index) => {
            const stats = categoryStats[category.id as keyof typeof categoryStats]
            const progress = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0
            const Icon = category.icon
            
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${category.color}`} />
                    <span className="text-sm text-slate-300">{category.label}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {stats.unlocked}/{stats.total} ({Math.round(progress)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      category.id === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                      category.id === 'epic' ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                      category.id === 'rare' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                      'bg-gradient-to-r from-slate-400 to-slate-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
})

export default AchievementStats
















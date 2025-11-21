'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Heart, 
  Crown,
  Award,
  Medal,
  Flame,
  Sparkles
} from 'lucide-react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'star' | 'target' | 'zap' | 'heart' | 'crown' | 'award' | 'medal' | 'flame'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  maxProgress?: number
  unlockedAt?: Date
  points: number
}

interface AchievementBadgeProps {
  achievement: Achievement
  isUnlocked?: boolean
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const AchievementBadge = memo(function AchievementBadge({
  achievement,
  isUnlocked = false,
  showProgress = true,
  size = 'md',
  onClick
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = () => {
    const iconProps = {
      className: `${
        size === 'sm' ? 'w-4 h-4' : 
        size === 'md' ? 'w-6 h-6' : 
        'w-8 h-8'
      }`
    }

    switch (achievement.icon) {
      case 'trophy':
        return <Trophy {...iconProps} />
      case 'star':
        return <Star {...iconProps} />
      case 'target':
        return <Target {...iconProps} />
      case 'zap':
        return <Zap {...iconProps} />
      case 'heart':
        return <Heart {...iconProps} />
      case 'crown':
        return <Crown {...iconProps} />
      case 'award':
        return <Award {...iconProps} />
      case 'medal':
        return <Medal {...iconProps} />
      case 'flame':
        return <Flame {...iconProps} />
      default:
        return <Star {...iconProps} />
    }
  }

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'common':
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/30',
          text: 'text-slate-300',
          icon: 'text-slate-400',
          glow: 'shadow-slate-500/20'
        }
      case 'rare':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          icon: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        }
      case 'epic':
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/30',
          text: 'text-purple-300',
          icon: 'text-purple-400',
          glow: 'shadow-purple-500/20'
        }
      case 'legendary':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-300',
          icon: 'text-yellow-400',
          glow: 'shadow-yellow-500/20'
        }
      default:
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/30',
          text: 'text-slate-300',
          icon: 'text-slate-400',
          glow: 'shadow-slate-500/20'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2'
      case 'md':
        return 'p-3'
      case 'lg':
        return 'p-4'
      default:
        return 'p-3'
    }
  }

  const colors = getRarityColors()
  const progress = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0

  return (
    <motion.div
      className={`relative group cursor-pointer ${getSizeClasses()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`
        relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300
        ${colors.bg} ${colors.border}
        ${isUnlocked ? `${colors.glow} shadow-lg` : 'opacity-60'}
        ${isHovered ? 'shadow-xl' : ''}
      `}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Animated background for legendary achievements */}
        {achievement.rarity === 'legendary' && isUnlocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        )}
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="flex items-center justify-center mb-2">
            <motion.div
              className={`
                p-2 rounded-lg transition-colors duration-300
                ${isUnlocked ? colors.icon : 'text-slate-500'}
              `}
              animate={isUnlocked ? {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              {getIcon()}
            </motion.div>
            
            {/* Sparkle effect for legendary achievements */}
            {achievement.rarity === 'legendary' && isUnlocked && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            )}
          </div>
          
          {/* Title */}
          <h4 className={`
            text-xs font-semibold text-center mb-1 transition-colors duration-300
            ${isUnlocked ? colors.text : 'text-slate-500'}
          `}>
            {achievement.title}
          </h4>
          
          {/* Progress bar */}
          {showProgress && achievement.progress !== undefined && achievement.maxProgress && (
            <div className="w-full bg-slate-700/50 rounded-full h-1 mb-2 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                  achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                  achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                  'bg-gradient-to-r from-slate-400 to-slate-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          )}
          
          {/* Points */}
          <div className="text-center">
            <span className={`
              text-xs font-medium
              ${isUnlocked ? colors.text : 'text-slate-500'}
            `}>
              {achievement.points} pts
            </span>
          </div>
        </div>
        
        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        />
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
          >
            <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 shadow-xl max-w-xs">
              <h5 className="text-sm font-semibold text-white mb-1">
                {achievement.title}
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                {achievement.description}
              </p>
              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mt-2 text-xs text-slate-400">
                  Прогресс: {achievement.progress}/{achievement.maxProgress}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default AchievementBadge
















'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  gradient: string
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  gradient, 
  trend,
  delay = 0 
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.3 }
      }}
      className="relative group"
    >
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 border border-slate-700/50 backdrop-blur-xl shadow-gradient`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-sm shadow-soft`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            {trend && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">{title}</h3>
            <p className="text-4xl font-bold text-white gradient-text">{value}</p>
          </div>

          {/* Animated progress bar */}
          <div className="mt-6 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${gradient.split(' ').slice(1, 3).join(' ')} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: delay + 0.5 }}
            />
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl" />
        
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl blur-xl`} />
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Settings, Cog, Wrench, Sliders } from 'lucide-react'

interface PremiumSettingsButtonProps {
  onClick: () => void
  isActive?: boolean
}

export default function PremiumSettingsButton({ onClick, isActive = false }: PremiumSettingsButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative group p-6 rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-500 ${
        isActive
          ? 'bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-blue-500/50 shadow-glow'
          : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 shadow-gradient hover:border-blue-500/50'
      }`}
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02, 
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.4, type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Анимированный переливающийся фон */}
      <motion.div 
        className="absolute inset-0 rounded-3xl"
        animate={{
          background: isActive ? [
            "linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15))",
            "linear-gradient(45deg, rgba(236, 72, 153, 0.15), rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))",
            "linear-gradient(45deg, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15), rgba(59, 130, 246, 0.15))",
            "linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15))"
          ] : [
            "linear-gradient(45deg, rgba(71, 85, 105, 0.1), rgba(51, 65, 85, 0.1), rgba(30, 41, 59, 0.1))",
            "linear-gradient(45deg, rgba(30, 41, 59, 0.1), rgba(71, 85, 105, 0.1), rgba(51, 65, 85, 0.1))",
            "linear-gradient(45deg, rgba(51, 65, 85, 0.1), rgba(30, 41, 59, 0.1), rgba(71, 85, 105, 0.1))",
            "linear-gradient(45deg, rgba(71, 85, 105, 0.1), rgba(51, 65, 85, 0.1), rgba(30, 41, 59, 0.1))"
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Плавающие частицы */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-3xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              isActive ? 'bg-blue-400/60' : 'bg-slate-400/40'
            }`}
            style={{
              left: `${(i * 12.5) % 100}%`,
              top: `${(i * 15) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * 20, 0],
              scale: [0.3, 1.2, 0.3],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 3 + (i * 0.3),
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
      </motion.div>

      {/* Светящийся эффект при наведении */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Основной контент */}
      <div className="relative z-10 flex items-center space-x-4">
        {/* Анимированная иконка */}
        <motion.div 
          className={`p-4 rounded-2xl shadow-soft ${
            isActive 
              ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30' 
              : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50'
          }`}
          whileHover={{ 
            scale: 1.1, 
            rotate: 360,
            boxShadow: isActive 
              ? "0 0 30px rgba(59, 130, 246, 0.6)"
              : "0 0 20px rgba(59, 130, 246, 0.4)",
            transition: { duration: 0.6, type: "spring", stiffness: 200 }
          }}
        >
          <motion.div
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 0.3 }
            }}
          >
            <Settings className={`w-8 h-8 ${isActive ? 'text-blue-400' : 'text-slate-300 group-hover:text-blue-400'}`} />
          </motion.div>
        </motion.div>

        {/* Текст */}
        <div className="text-left">
          <motion.h3 
            className={`text-xl font-bold mb-1 ${
              isActive ? 'text-blue-400' : 'text-white group-hover:text-blue-400'
            }`}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
          >
            Настройки
          </motion.h3>
          
          <motion.p 
            className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300"
            whileHover={{ 
              x: 5,
              transition: { duration: 0.2 }
            }}
          >
            Управление аккаунтом
          </motion.p>
        </div>

        {/* Дополнительные иконки */}
        <motion.div 
          className="ml-auto flex space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            whileHover={{ 
              scale: 1.2, 
              rotate: 180,
              transition: { duration: 0.4 }
            }}
            className="p-2 rounded-lg bg-slate-700/30"
          >
            <Cog className="w-4 h-4 text-slate-400" />
          </motion.div>
          <motion.div
            whileHover={{ 
              scale: 1.2, 
              rotate: -180,
              transition: { duration: 0.4 }
            }}
            className="p-2 rounded-lg bg-slate-700/30"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Анимированная рамка */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-transparent"
        whileHover={{
          borderImage: isActive 
            ? "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1"
            : "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1",
          transition: { duration: 0.3 }
        }}
      />

      {/* Пульсирующий эффект для активного состояния */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-blue-500/50"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  )
}


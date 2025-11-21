'use client'

import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield, LogOut, Edit3, Crown, Star, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AvatarImage from './AvatarImage'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: 'user' | 'admin' | 'super_admin'
}

interface PremiumUserProfileProps {
  user: User
  onLogout: () => void
  onEdit?: () => void
  isActive?: boolean
}

export default function PremiumUserProfile({ user, onLogout, onEdit, isActive = false }: PremiumUserProfileProps) {
  const router = useRouter()
  
  // Генерируем инициалы из имени
  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
      return '??';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Генерируем градиент на основе имени
  const getGradient = (name: string) => {
    const gradients = [
      'from-blue-500/30 to-cyan-500/30',
      'from-purple-500/30 to-pink-500/30',
      'from-green-500/30 to-emerald-500/30',
      'from-orange-500/30 to-yellow-500/30',
      'from-red-500/30 to-rose-500/30',
      'from-indigo-500/30 to-blue-500/30'
    ]
    const index = name.length % gradients.length
    return gradients[index]
  }

  const gradient = getGradient(user.name)
  const initials = getInitials(user.name)

  return (
    <motion.div
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
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              isActive ? 'bg-blue-400/60' : 'bg-slate-400/40'
            }`}
            style={{
              left: `${(i * 16.67) % 100}%`,
              top: `${(i * 20) % 100}%`,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * 15, 0],
              scale: [0.3, 1, 0.3],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 2.5 + (i * 0.2),
              repeat: Infinity,
              delay: i * 0.3
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
        {/* Анимированный аватар */}
        <motion.div 
          className="relative"
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.3 }
          }}
        >
          <motion.div 
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-soft relative overflow-hidden bg-gradient-to-br ${gradient}`}
            whileHover={{ 
              boxShadow: isActive 
                ? "0 0 30px rgba(59, 130, 246, 0.6)"
                : "0 0 20px rgba(59, 130, 246, 0.4)",
              transition: { duration: 0.3 }
            }}
          >
            {/* Анимированный фон аватара */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full`}
              animate={{
                background: [
                  `linear-gradient(45deg, ${gradient.split(' ')[0]}, ${gradient.split(' ')[2]}, ${gradient.split(' ')[4]})`,
                  `linear-gradient(45deg, ${gradient.split(' ')[4]}, ${gradient.split(' ')[0]}, ${gradient.split(' ')[2]})`,
                  `linear-gradient(45deg, ${gradient.split(' ')[2]}, ${gradient.split(' ')[4]}, ${gradient.split(' ')[0]})`,
                  `linear-gradient(45deg, ${gradient.split(' ')[0]}, ${gradient.split(' ')[2]}, ${gradient.split(' ')[4]})`
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Вращающийся аватар */}
            <motion.div
              className="relative z-10 w-full h-full flex items-center justify-center"
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
            >
              {user.avatar ? (
                <AvatarImage 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                initials
              )}
            </motion.div>

            {/* Статус онлайн */}
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>

        {/* Информация о пользователе */}
        <div className="flex-1 text-left">
          <motion.div 
            className="flex items-center space-x-2 mb-1"
            whileHover={{ 
              x: 5,
              transition: { duration: 0.2 }
            }}
          >
            <motion.h3 
              className={`text-xl font-bold ${
                isActive ? 'text-blue-400' : 'text-white group-hover:text-blue-400'
              }`}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              {user.name}
            </motion.h3>
            
            {/* Премиум бейдж */}
            <motion.div
              className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30"
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
            >
              <Crown className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">PRO</span>
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300 flex items-center space-x-1"
            whileHover={{ 
              x: 5,
              transition: { duration: 0.2 }
            }}
          >
            <Mail className="w-3 h-3" />
            <span>{user.email}</span>
          </motion.p>

          {/* Дополнительная информация */}
          <motion.div 
            className="flex items-center space-x-4 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="flex items-center space-x-1 text-xs text-slate-500"
              whileHover={{ 
                scale: 1.05,
                color: "#60a5fa",
                transition: { duration: 0.2 }
              }}
            >
              <Calendar className="w-3 h-3" />
              <span>Активен</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-1 text-xs text-slate-500"
              whileHover={{ 
                scale: 1.05,
                color: "#10b981",
                transition: { duration: 0.2 }
              }}
            >
              <Shield className="w-3 h-3" />
              <span>Защищен</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Действия */}
        <motion.div 
          className="flex flex-col space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Кнопка редактирования */}
          {onEdit && (
            <motion.button
              onClick={onEdit}
              className="p-2 rounded-lg bg-slate-700/30 hover:bg-blue-600/30 text-slate-400 hover:text-blue-400 transition-all duration-300"
              whileHover={{ 
                scale: 1.1, 
                rotate: 15,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
          )}

          {/* Кнопка админ-панели для администраторов */}
          {user.role && ['admin', 'super_admin'].includes(user.role) && (
            <motion.button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 transition-all duration-300"
              whileHover={{ 
                scale: 1.1, 
                rotate: -15,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              title="Админ-панель"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}

          {/* Кнопка выхода */}
          <motion.button
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all duration-300"
            whileHover={{ 
              scale: 1.1, 
              rotate: -15,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
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

      {/* Дополнительные декоративные элементы */}
      <motion.div
        className="absolute top-4 right-4 opacity-20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Star className="w-6 h-6 text-blue-400" />
      </motion.div>
    </motion.div>
  )
}


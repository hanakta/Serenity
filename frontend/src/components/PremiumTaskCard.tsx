'use client'

import { motion } from 'framer-motion'
import { Check, Edit, Trash2, Clock, Flag, Calendar, Star } from 'lucide-react'
import { Task, PRIORITY_ICONS, PRIORITY_LABELS, PRIORITY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, isOverdue, isDueToday, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PremiumTaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleComplete?: (task: Task) => void
  index?: number
}

export default function PremiumTaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete, 
  index = 0 
}: PremiumTaskCardProps) {
  const isCompleted = task.status === 'completed'
  const isOverdueTask = isOverdue(task)
  const isDueTodayTask = isDueToday(task)

  // Обработчики событий
  const handleToggleComplete = () => {
    onToggleComplete?.(task)
  }

  const handleEdit = () => {
    onEdit?.(task)
  }

  const handleDelete = () => {
    onDelete?.(task)
  }

  const priorityGradients = {
    low: 'from-green-500/20 to-emerald-500/20',
    medium: 'from-blue-500/20 to-cyan-500/20',
    high: 'from-orange-500/20 to-yellow-500/20',
    urgent: 'from-red-500/20 to-pink-500/20'
  }

  const statusGradients = {
    todo: 'from-slate-500/20 to-gray-500/20',
    in_progress: 'from-blue-500/20 to-indigo-500/20',
    completed: 'from-green-500/20 to-emerald-500/20',
    cancelled: 'from-red-500/20 to-rose-500/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.06,
        type: "spring",
        stiffness: 150,
        damping: 22
      }}
      whileHover={{ 
        scale: 1.015,
        y: -3,
        transition: { 
          duration: 0.25,
          type: "spring",
          stiffness: 500,
          damping: 30
        }
      }}
      whileTap={{ 
        scale: 0.99,
        transition: { duration: 0.1 }
      }}
      className="group relative"
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl border-2 transition-all duration-500 backdrop-blur-xl shadow-hover",
        isCompleted && "opacity-60 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-cool",
        isOverdueTask && "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30 shadow-warm",
        !isCompleted && !isOverdueTask && "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 shadow-soft",
        task.priority === 'urgent' && "border-red-400/50 shadow-warm-gradient",
        task.priority === 'high' && "border-orange-400/50 shadow-warm"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-15">
          <motion.div 
            className={cn(
              "absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl",
              priorityGradients[task.priority].split(' ')[0].replace('from-', 'bg-').replace('/20', '')
            )}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Priority indicator */}
        <motion.div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            task.priority === 'urgent' && "from-red-500 to-pink-500",
            task.priority === 'high' && "from-orange-500 to-yellow-500",
            task.priority === 'medium' && "from-blue-500 to-cyan-500",
            task.priority === 'low' && "from-green-500 to-emerald-500"
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ 
            delay: 0.2 + index * 0.05,
            duration: 0.6,
            ease: "easeOut"
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-xl font-bold text-white mb-2 transition-all duration-300 truncate",
                isCompleted && "line-through text-slate-400"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <motion.div 
              className="flex items-center space-x-2 ml-4 flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                delay: 0.3 + index * 0.05,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              <motion.div 
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border relative overflow-hidden",
                  PRIORITY_COLORS[task.priority]
                )}
                whileHover={{ 
                  scale: 1.05,
                  y: -1,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                />
                <motion.span 
                  className="text-sm flex items-center justify-center relative z-10"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {PRIORITY_ICONS[task.priority]}
                </motion.span>
                <span className="whitespace-nowrap relative z-10">{PRIORITY_LABELS[task.priority]}</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Tags and Status */}
          <div className="flex flex-col space-y-4 mb-6">
            <motion.div 
              className="flex items-center space-x-3 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              {/* Category */}
              <motion.div 
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border relative overflow-hidden",
                  CATEGORY_COLORS[task.category]
                )}
                whileHover={{ 
                  scale: 1.05,
                  y: -1,
                  transition: { duration: 0.2 }
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.05, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                />
                <motion.span 
                  className="text-sm flex items-center justify-center relative z-10"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {CATEGORY_ICONS[task.category]}
                </motion.span>
                <span className="whitespace-nowrap relative z-10">{CATEGORY_LABELS[task.category]}</span>
              </motion.div>

              {/* Status */}
              <motion.div 
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border relative overflow-hidden",
                  task.status === 'completed' && "bg-green-500/20 text-green-400 border-green-500/30",
                  task.status === 'in_progress' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                  task.status === 'todo' && "bg-slate-500/20 text-slate-400 border-slate-500/30",
                  task.status === 'cancelled' && "bg-red-500/20 text-red-400 border-red-500/30"
                )}
                whileHover={{ 
                  scale: 1.05,
                  y: -1,
                  transition: { duration: 0.2 }
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.05, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                />
                <motion.span 
                  className="whitespace-nowrap relative z-10"
                  animate={task.status === 'completed' ? {
                    scale: [1, 1.05, 1],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  } : {}}
                >
                  {STATUS_LABELS[task.status]}
                </motion.span>
                {task.status === 'completed' && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Star className="w-3 h-3 text-yellow-400" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Actions */}
            <motion.div 
              className="flex items-center justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              <motion.div 
                className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: 20, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {!isCompleted && (
                  <motion.button
                    whileHover={{ 
                      scale: 1.1,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.9,
                      transition: { duration: 0.1 }
                    }}
                    onClick={handleToggleComplete}
                    className="p-2.5 hover:bg-green-500/20 text-green-400 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group/btn"
                    title="Отметить как выполненное"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { duration: 0.1 }
                  }}
                  onClick={handleEdit}
                  className="p-2.5 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group/btn"
                  title="Редактировать"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.div>
                </motion.button>
                
                <motion.button
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { duration: 0.1 }
                  }}
                  onClick={handleDelete}
                  className="p-2.5 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group/btn"
                  title="Удалить"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <motion.div 
                className={cn(
                  "flex items-center space-x-2 text-sm",
                  isOverdueTask && "text-red-400 font-medium",
                  isDueTodayTask && !isOverdueTask && "text-orange-400 font-medium",
                  !isOverdueTask && !isDueTodayTask && "text-slate-400"
                )}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={isOverdueTask ? {
                    scale: [1, 1.1, 1],
                    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  } : {}}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                </motion.div>
                <span className="truncate">
                  {formatDateTime(task.due_date)}
                </span>
              </motion.div>
              
              <div className="flex items-center space-x-2">
                {isOverdueTask && (
                  <motion.span 
                    className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30"
                    animate={{
                      scale: [1, 1.05, 1],
                      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    Просрочено
                  </motion.span>
                )}
                {isDueTodayTask && !isOverdueTask && (
                  <motion.span 
                    className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium border border-orange-500/30"
                    animate={{
                      scale: [1, 1.05, 1],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    Сегодня
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.05 }}
            >
              {task.tags.map((tag, tagIndex) => (
                <motion.span
                  key={tag.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border relative overflow-hidden group/tag"
                  style={{ 
                    backgroundColor: tag.color + '20', 
                    color: tag.color,
                    borderColor: tag.color + '30'
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: 1.0 + index * 0.05 + tagIndex * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300"
                  />
                  <span className="relative z-10">{tag.name}</span>
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  )
}

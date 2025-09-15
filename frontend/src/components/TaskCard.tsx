'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, Edit, Trash2, Clock, Flag } from 'lucide-react'
import { Task, PRIORITY_ICONS, PRIORITY_LABELS, PRIORITY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, isOverdue, isDueToday, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleComplete?: (task: Task) => void
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const isCompleted = task.status === 'completed'
  const isOverdueTask = isOverdue(task)
  const isDueTodayTask = isDueToday(task)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 shadow-hover",
        isCompleted && "opacity-60 bg-green-50 border-green-200",
        isOverdueTask && "border-red-200 bg-red-50",
        task.priority === 'urgent' && "border-red-300 shadow-warm",
        task.priority === 'high' && "border-orange-300 shadow-warm"
      )}>
        {/* Приоритетная полоса */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          task.priority === 'urgent' && "bg-red-500",
          task.priority === 'high' && "bg-orange-500",
          task.priority === 'medium' && "bg-blue-500",
          task.priority === 'low' && "bg-green-500"
        )} />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={cn(
                "text-lg font-semibold line-clamp-2",
                isCompleted && "line-through text-gray-500"
              )}>
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {/* Приоритет */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                PRIORITY_COLORS[task.priority]
              )}>
                <span className="text-sm">{PRIORITY_ICONS[task.priority]}</span>
                <span>{PRIORITY_LABELS[task.priority]}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Категория */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                CATEGORY_COLORS[task.category]
              )}>
                <span className="text-sm">{CATEGORY_ICONS[task.category]}</span>
                <span>{CATEGORY_LABELS[task.category]}</span>
              </div>

              {/* Статус */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                task.status === 'completed' && "bg-green-100 text-green-700",
                task.status === 'in_progress' && "bg-blue-100 text-blue-700",
                task.status === 'todo' && "bg-gray-100 text-gray-700",
                task.status === 'cancelled' && "bg-red-100 text-red-700"
              )}>
                <span>{STATUS_LABELS[task.status]}</span>
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-1">
              {!isCompleted && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onToggleComplete?.(task)}
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit?.(task)}
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete?.(task)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Дедлайн */}
          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1 mt-3 text-xs",
              isOverdueTask && "text-red-600 font-medium",
              isDueTodayTask && !isOverdueTask && "text-orange-600 font-medium",
              !isOverdueTask && !isDueTodayTask && "text-gray-500"
            )}>
              <Clock className="h-3 w-3" />
              <span>
                {formatDateTime(task.due_date)}
              </span>
              {isOverdueTask && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                  Просрочено
                </span>
              )}
              {isDueTodayTask && !isOverdueTask && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                  Сегодня
                </span>
              )}
            </div>
          )}

          {/* Теги */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
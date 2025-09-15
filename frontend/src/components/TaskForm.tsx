'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { X, Save, Plus } from 'lucide-react'
import { Task, PRIORITY_ICONS, PRIORITY_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/utils'

interface TaskFormProps {
  task?: Task
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: Partial<Task>) => void
  projects?: Array<{ id: string; name: string; color: string }>
}

export default function TaskForm({ task, isOpen, onClose, onSave, projects = [] }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'personal' as const,
    due_date: '',
    project_id: ''
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        category: task.category,
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        project_id: task.project_id || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        due_date: '',
        project_id: ''
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const taskData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      project_id: formData.project_id || undefined
    }

    onSave(taskData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-2 shadow-large">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">
              {task ? 'Редактировать задачу' : 'Создать новую задачу'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Заголовок */}
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите заголовок задачи"
                  required
                />
              </div>

              {/* Описание */}
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Введите описание задачи"
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Приоритет и категория */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Приоритет */}
                <div className="space-y-2">
                  <Label>Приоритет</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PRIORITY_ICONS).map(([key, icon]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={formData.priority === key ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, priority: key as any })}
                        className="flex items-center gap-2"
                      >
                        <span>{icon}</span>
                        <span className="text-xs">{PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS]}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Категория */}
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CATEGORY_ICONS).map(([key, icon]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={formData.category === key ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, category: key as any })}
                        className="flex items-center gap-2"
                      >
                        <span>{icon}</span>
                        <span className="text-xs">{CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Проект и дедлайн */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Проект */}
                <div className="space-y-2">
                  <Label htmlFor="project">Проект</Label>
                  <select
                    id="project"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Без проекта</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Дедлайн */}
                <div className="space-y-2">
                  <Label htmlFor="due_date">Дедлайн</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                >
                  {task ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {task ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

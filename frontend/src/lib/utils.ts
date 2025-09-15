import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'personal' | 'work' | 'health' | 'learning' | 'shopping' | 'other'
  due_date?: string
  user_id: string
  project_id?: string
  created_at: string
  updated_at: string
  completed_at?: string
  project_name?: string
  project_color?: string
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface TaskStats {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  todo_tasks: number
  urgent_tasks: number
  high_priority_tasks: number
  overdue_tasks: number
  by_category: Record<string, number>
  by_priority: Record<string, number>
}

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  category?: string[]
  project_id?: string
  search?: string
  due_date_from?: string
  due_date_to?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' },
]

export const PRIORITY_ICONS = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴',
}

export const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный',
}

export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

// Category options
export const CATEGORY_OPTIONS = [
  { value: 'personal', label: 'Личные' },
  { value: 'work', label: 'Работа' },
  { value: 'health', label: 'Здоровье' },
  { value: 'learning', label: 'Обучение' },
  { value: 'shopping', label: 'Покупки' },
  { value: 'other', label: 'Другое' },
]

export const CATEGORY_ICONS = {
  personal: '👤',
  work: '💼',
  health: '🏥',
  learning: '📚',
  shopping: '🛒',
  other: '📝',
}

export const CATEGORY_LABELS = {
  personal: 'Личные',
  work: 'Работа',
  health: 'Здоровье',
  learning: 'Обучение',
  shopping: 'Покупки',
  other: 'Другое',
}

export const CATEGORY_COLORS = {
  personal: 'bg-blue-100 text-blue-700',
  work: 'bg-purple-100 text-purple-700',
  health: 'bg-green-100 text-green-700',
  learning: 'bg-yellow-100 text-yellow-700',
  shopping: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
}

// Status options
export const STATUS_OPTIONS = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed', label: 'Выполнено' },
  { value: 'cancelled', label: 'Отменено' },
]

export const STATUS_LABELS = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  completed: 'Выполнено',
  cancelled: 'Отменено',
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Task utilities
export function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'completed') return false
  return new Date(task.due_date) < new Date()
}

export function isDueToday(task: Task): boolean {
  if (!task.due_date) return false
  const today = new Date()
  const dueDate = new Date(task.due_date)
  return dueDate.toDateString() === today.toDateString()
}

export function getTaskStatusColor(task: Task): string {
  if (task.status === 'completed') return 'text-green-600'
  if (isOverdue(task)) return 'text-red-600'
  if (isDueToday(task)) return 'text-orange-600'
  return 'text-gray-600'
}
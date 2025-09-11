// 🐱 Общие типы для Serenity - менеджера задач

// Типы для пользователей
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Приоритеты задач с животными иконками
export enum TaskPriority {
  LOW = 'low',      // 🐰 Кролик - быстрые задачи
  MEDIUM = 'medium', // 🐱 Кот - обычные задачи
  HIGH = 'high',     // 🐶 Собака - важные задачи
  URGENT = 'urgent'  // 🐸 Лягушка - срочные задачи
}

// Статусы задач
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Категории задач с животными иконками
export enum TaskCategory {
  PERSONAL = 'personal',     // 🐱 Кот - личные задачи
  WORK = 'work',             // 🐶 Собака - рабочие задачи
  CREATIVE = 'creative',     // 🦊 Лиса - творческие задачи
  HEALTH = 'health',         // 🐰 Кролик - здоровье
  LEARNING = 'learning',     // 🐸 Лягушка - обучение
  OTHER = 'other'            // 🐾 Общие задачи
}

// Основная модель задачи
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  completedAt?: Date;
  userId: string;
  projectId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Модель проекта
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

// Теги для задач
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}

// API ответы
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Пагинация
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Фильтры для задач
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  projectId?: string;
  tags?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

// Настройки пользователя
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  defaultView: 'list' | 'kanban' | 'calendar';
  timezone: string;
}

// Статистика продуктивности
export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByCategory: Record<TaskCategory, number>;
  averageCompletionTime: number; // в часах
  streak: number; // дней подряд с выполненными задачами
}

// Уведомления
export interface Notification {
  id: string;
  type: 'task_due' | 'task_completed' | 'project_update' | 'team_invite';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: Date;
}

// Экспорт всех типов
export * from './api';
export * from './forms';

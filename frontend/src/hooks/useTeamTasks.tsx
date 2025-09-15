'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TeamTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  user_id: string;
  project_id?: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  project_name?: string;
  team_name?: string;
}

export interface TeamProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
}

export interface TeamTaskComment {
  id: string;
  team_id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface TeamStats {
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
  projects: {
    total: number;
    active: number;
  };
  members: {
    total: number;
    active: number;
  };
}

export const useTeamTasks = () => {
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [teamProjects, setTeamProjects] = useState<TeamProject[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Получение токена
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Получение командных задач
  const getTeamTasks = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        setTeamTasks([]);
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки командных задач');
      }

      const data = await response.json();
      // API возвращает { tasks: [] }, а не просто массив
      const tasks = Array.isArray(data.data?.tasks) ? data.data.tasks : [];
      setTeamTasks(tasks);
      return tasks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки командных задач');
      console.error('Ошибка загрузки командных задач:', err);
      setTeamTasks([]); // Убеждаемся, что это массив
      return [];
    } finally {
      setLoading(false);
    }
  }, [])

  // Получение проектов команды
  const getTeamProjects = useCallback(async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        setTeamProjects([]);
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки проектов команды');
      }

      const data = await response.json();
      // API возвращает { projects: [] }, а не просто массив
      const projects = Array.isArray(data.data?.projects) ? data.data.projects : [];
      setTeamProjects(projects);
      return projects;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов команды');
      console.error('Ошибка загрузки проектов команды:', err);
      setTeamProjects([]); // Убеждаемся, что это массив
      return [];
    }
  }, [])

  // Получение статистики команды
  const getTeamStats = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики команды');
      }

      const data = await response.json();
      setTeamStats(data.data || null);
      return data.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики команды');
      console.error('Ошибка загрузки статистики команды:', err);
      return null;
    }
  };

  // Создание командной задачи
  const createTeamTask = async (teamId: string, taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    project_id?: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Если есть детали ошибок валидации, показываем их
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages = Object.values(errorData.errors).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.message || 'Ошибка создания командной задачи');
      }

      const data = await response.json();
      await getTeamTasks(teamId); // Обновляем список задач
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания командной задачи');
      throw err;
    }
  };

  // Обновление командной задачи
  const updateTeamTask = async (taskId: string, updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    project_id?: string;
    completed_at?: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Если есть детали ошибок валидации, показываем их
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages = Object.values(errorData.errors).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.message || 'Ошибка обновления задачи');
      }

      const data = await response.json();
      // Обновляем локальное состояние
      setTeamTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления задачи');
      throw err;
    }
  };

  // Удаление командной задачи
  const deleteTeamTask = async (taskId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления задачи');
      }

      // Удаляем из локального состояния
      setTeamTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления задачи');
      throw err;
    }
  };

  // Создание проекта команды
  const createTeamProject = async (teamId: string, projectData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка создания проекта команды');
      }

      const data = await response.json();
      await getTeamProjects(teamId); // Обновляем список проектов
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания проекта команды');
      throw err;
    }
  };

  // Обновление проекта команды
  const updateTeamProject = async (projectId: string, updates: {
    name?: string;
    description?: string;
    color?: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления проекта');
      }

      const data = await response.json();
      // Обновляем локальное состояние
      setTeamProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, ...updates } : project
      ));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления проекта');
      throw err;
    }
  };

  // Удаление проекта команды
  const deleteTeamProject = async (projectId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления проекта');
      }

      // Удаляем из локального состояния
      setTeamProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления проекта');
      throw err;
    }
  };

  // Получение комментариев к задаче
  const getTaskComments = async (taskId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки комментариев');
      }

      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки комментариев');
      console.error('Ошибка загрузки комментариев:', err);
      return [];
    }
  };

  // Добавление комментария к задаче
  const addTaskComment = async (taskId: string, content: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка добавления комментария');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления комментария');
      throw err;
    }
  };

  return {
    teamTasks,
    teamProjects,
    teamStats,
    loading,
    error,
    getTeamTasks,
    getTeamProjects,
    getTeamStats,
    createTeamTask,
    updateTeamTask,
    deleteTeamTask,
    createTeamProject,
    updateTeamProject,
    deleteTeamProject,
    getTaskComments,
    addTaskComment
  };
};

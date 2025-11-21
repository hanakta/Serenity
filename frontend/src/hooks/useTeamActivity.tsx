'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  activity_type: string;
  activity_data: {
    task_title?: string;
    project_name?: string;
    file_name?: string;
    message?: string;
    [key: string]: unknown;
  };
  target_id?: string;
  target_type?: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface TeamNotification {
  id: string;
  team_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    task_id?: string;
    project_id?: string;
    file_id?: string;
    message_id?: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  created_at: string;
}

export const useTeamActivity = () => {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [notifications, setNotifications] = useState<TeamNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Получение токена
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Получение активности команды
  const getTeamActivity = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        console.warn('Токен не найден, используем демо данные');
        setActivities([]);
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/collaboration/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Если ошибка аутентификации, используем демо данные
        if (response.status === 401) {
          console.warn('Ошибка аутентификации, переходим в демо режим');
          localStorage.removeItem('token');
          setDemoMode(true);
          setError(null); // Не показываем ошибку, используем демо данные
          return [];
        }
        
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        throw new Error(`Ошибка загрузки активности команды: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // API возвращает { activities: [] }, а не { data: { activities: [] } }
      const activities = Array.isArray(data.data?.activities) ? data.data.activities : [];
      setActivities(activities);
      return activities;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки активности команды');
      console.error('Ошибка загрузки активности команды:', err);
      
      // Fallback данные для демонстрации
      const fallbackActivities = [
        {
          id: 'demo_activity_1',
          team_id: teamId,
          user_id: 'demo_user',
          activity_type: 'task_created',
          activity_data: {
            task_title: 'Демо задача',
            task_id: 'demo_task_1'
          },
          target_id: 'demo_task_1',
          target_type: 'task',
          created_at: new Date().toISOString(),
          user_name: 'Демо Пользователь',
          user_avatar: null
        },
        {
          id: 'demo_activity_2',
          team_id: teamId,
          user_id: 'demo_user',
          activity_type: 'comment_added',
          activity_data: {
            comment_content: 'Демо комментарий',
            task_title: 'Демо задача'
          },
          target_id: 'demo_comment_1',
          target_type: 'comment',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_name: 'Демо Пользователь',
          user_avatar: null
        }
      ];
      
      setActivities(fallbackActivities);
      setDemoMode(true);
      return fallbackActivities;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение уведомлений команды
  const getTeamNotifications = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('Токен не найден, используем демо данные');
        setNotifications([]);
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/collaboration/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Если ошибка аутентификации, используем демо данные
        if (response.status === 401) {
          console.warn('Ошибка аутентификации, переходим в демо режим');
          localStorage.removeItem('token');
          setDemoMode(true);
          setError(null); // Не показываем ошибку, используем демо данные
          return [];
        }
        
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        throw new Error(`Ошибка загрузки уведомлений: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.data || []);
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки уведомлений');
      console.error('Ошибка загрузки уведомлений:', err);
      
      // Fallback данные для демонстрации
      const fallbackNotifications = [
        {
          id: 'demo_notif_1',
          team_id: teamId,
          user_id: 'demo_user',
          type: 'task_assigned',
          title: 'Новая задача назначена',
          message: 'Вам назначена новая задача "Демо задача"',
          data: {
            task_id: 'demo_task_1'
          },
          is_read: false,
          created_at: new Date().toISOString(),
          user_name: 'Демо Пользователь',
          user_avatar: null
        },
        {
          id: 'demo_notif_2',
          team_id: teamId,
          user_id: 'demo_user',
          type: 'comment_added',
          title: 'Новый комментарий',
          message: 'Добавлен комментарий к задаче "Демо задача"',
          data: {
            task_id: 'demo_task_1',
            comment_id: 'demo_comment_1'
          },
          is_read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_name: 'Демо Пользователь',
          user_avatar: null
        }
      ];
      
      setNotifications(fallbackNotifications);
      setDemoMode(true);
      return fallbackNotifications;
    }
  };

  // Отметка уведомления как прочитанного
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отметки уведомления как прочитанного');
      }

      // Обновляем локальное состояние
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отметки уведомления как прочитанного');
      console.error('Ошибка отметки уведомления как прочитанного:', err);
    }
  };

  // Отметка всех уведомлений как прочитанных
  const markAllNotificationsAsRead = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отметки всех уведомлений как прочитанных');
      }

      // Обновляем локальное состояние
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отметки всех уведомлений как прочитанных');
      console.error('Ошибка отметки всех уведомлений как прочитанных:', err);
    }
  };

  // Удаление уведомления
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления уведомления');
      }

      // Удаляем из локального состояния
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления уведомления');
      console.error('Ошибка удаления уведомления:', err);
    }
  };

  // Создание активности (для внутреннего использования)
  const createActivity = async (teamId: string, activityData: {
    activity_type: string;
    activity_data: Record<string, unknown>;
    target_id?: string;
    target_type?: string;
  }) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/collaboration/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка создания активности');
      }

      const data = await response.json();
      await getTeamActivity(teamId); // Обновляем активность
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания активности');
      console.error('Ошибка создания активности:', err);
      throw err;
    }
  };

  // Получение статистики активности
  const getActivityStats = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/collaboration/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики активности');
      }

      const data = await response.json();
      return data.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики активности');
      console.error('Ошибка загрузки статистики активности:', err);
      return null;
    }
  };

  return {
    activities,
    notifications,
    loading,
    error,
    demoMode,
    getTeamActivity,
    getTeamNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createActivity,
    getActivityStats
  };
};

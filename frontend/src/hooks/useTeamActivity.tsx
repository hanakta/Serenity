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
        setError('Токен не найден');
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
        throw new Error('Ошибка загрузки активности команды');
      }

      const data = await response.json();
      // API возвращает { activities: [] }, а не { data: { activities: [] } }
      const activities = Array.isArray(data.data?.activities) ? data.data.activities : [];
      setActivities(activities);
      return activities;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки активности команды');
      console.error('Ошибка загрузки активности команды:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение уведомлений команды
  const getTeamNotifications = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        setNotifications([]);
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки уведомлений');
      }

      const data = await response.json();
      setNotifications(data.data || []);
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки уведомлений');
      console.error('Ошибка загрузки уведомлений:', err);
      return [];
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
    getTeamActivity,
    getTeamNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createActivity,
    getActivityStats
  };
};

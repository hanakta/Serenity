import { useState, useEffect, useCallback } from 'react';

interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: string;
  token: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
  team_name?: string;
  team_description?: string;
  team_color?: string;
  invited_by_name?: string;
}

interface InvitationResponse {
  success: boolean;
  data?: {
    invitations: TeamInvitation[];
  };
  message?: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Получить приглашения команды
  const getTeamInvitations = useCallback(async (teamId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/invitations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка получения приглашений команды');
      }

      const data: InvitationResponse = await response.json();
      return data.data?.invitations || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения приглашений команды');
      console.error('Ошибка получения приглашений команды:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Отправить приглашение в команду
  const sendInvitation = useCallback(async (teamId: string, email: string, role: string = 'member') => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отправки приглашения');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки приглашения');
      console.error('Ошибка отправки приглашения:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получить приглашения пользователя
  const getUserInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/invitations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка получения приглашений');
      }

      const data: InvitationResponse = await response.json();
      setInvitations(data.data?.invitations || []);
      return data.data?.invitations || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения приглашений');
      console.error('Ошибка получения приглашений:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Принять приглашение
  const acceptInvitation = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getToken();
      if (!authToken) {
        setError('Токен авторизации не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка принятия приглашения');
      }

      const data = await response.json();
      
      // Обновляем список приглашений
      await getUserInvitations();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка принятия приглашения');
      console.error('Ошибка принятия приглашения:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserInvitations]);

  // Отклонить приглашение
  const declineInvitation = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getToken();
      if (!authToken) {
        setError('Токен авторизации не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/invitations/${token}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отклонения приглашения');
      }

      const data = await response.json();
      
      // Обновляем список приглашений
      await getUserInvitations();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отклонения приглашения');
      console.error('Ошибка отклонения приглашения:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserInvitations]);

  // Получить информацию о приглашении по токену
  const getInvitationInfo = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getToken();
      if (!authToken) {
        setError('Токен авторизации не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/invitations/${token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка получения информации о приглашении');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения информации о приглашении');
      console.error('Ошибка получения информации о приглашении:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Форматирование времени
  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (minutes < 60) {
        return `${minutes} мин назад`;
      } else if (hours < 24) {
        return `${hours} ч назад`;
      } else {
        return `${days} дн назад`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'недавно';
    }
  };

  // Проверка, истекло ли приглашение
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Загружаем приглашения при инициализации
  useEffect(() => {
    getUserInvitations();
  }, [getUserInvitations]);

  return {
    invitations,
    loading,
    error,
    getUserInvitations,
    getTeamInvitations,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    getInvitationInfo,
    formatTimeAgo,
    isExpired
  };
};
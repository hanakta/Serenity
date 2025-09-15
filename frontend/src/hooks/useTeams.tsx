'use client';

import { useState, useEffect, useCallback } from 'react';
import { registerStateListener, checkAndClearState } from '@/lib/userStateManager';

export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
  projectCount?: number;
  isOwner?: boolean;
  isMember?: boolean;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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

  // Очистка состояния при смене пользователя
  const clearState = useCallback(() => {
    setTeams([]);
    setTeamMembers([]);
    setError(null);
  }, []);

  // Загрузка команд пользователя
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        clearState(); // Очищаем состояние если нет токена
        return; // Просто возвращаемся, не выбрасываем ошибку
      }

      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки команд');
      }

      const data = await response.json();
      setTeams(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      console.error('Ошибка загрузки команд:', err);
      clearState(); // Очищаем состояние при ошибке
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, clearState]);

  // Создание команды
  const createTeam = async (teamData: {
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

      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Если есть детали ошибок валидации, показываем их
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages = Object.values(errorData.errors).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.message || 'Ошибка создания команды');
      }

      const data = await response.json();
      await fetchTeams(); // Обновляем список команд
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания команды');
      throw err;
    }
  };

  // Обновление команды
  const updateTeam = async (teamId: string, teamData: {
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

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Если есть детали ошибок валидации, показываем их
        if (errorData.errors && typeof errorData.errors === 'object') {
          const errorMessages = Object.values(errorData.errors).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.message || 'Ошибка обновления команды');
      }

      const data = await response.json();
      await fetchTeams(); // Обновляем список команд
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления команды');
      throw err;
    }
  };

  // Удаление команды
  const deleteTeam = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления команды');
      }

      await fetchTeams(); // Обновляем список команд
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления команды');
      throw err;
    }
  };

  // Присоединение к команде
  const joinTeam = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Если пользователь уже участник команды, это не ошибка
        if (errorData.message && errorData.message.includes('уже являетесь участником')) {
          console.log('Пользователь уже участник команды');
          return { success: true, message: 'Вы уже участник этой команды' };
        }
        throw new Error(errorData.message || 'Ошибка присоединения к команде');
      }

      const data = await response.json();
      await fetchTeams(); // Обновляем список команд
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка присоединения к команде');
      throw err;
    }
  };

  // Покидание команды
  const leaveTeam = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка покидания команды');
      }

      await fetchTeams(); // Обновляем список команд
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка покидания команды');
      throw err;
    }
  };

  // Приглашение пользователя в команду
  const inviteUser = async (teamId: string, email: string, role: 'admin' | 'member' | 'viewer' = 'member') => {
    try {
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
      throw err;
    }
  };

  // Получение участников команды
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки участников команды');
      }

      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки участников команды');
      throw err;
    }
  };

  // Удаление участника из команды
  const removeMember = async (teamId: string, userId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления участника');
      }

      await fetchTeamMembers(teamId); // Обновляем список участников
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления участника');
      throw err;
    }
  };

  // Изменение роли участника
  const updateMemberRole = async (teamId: string, userId: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка изменения роли участника');
      }

      const data = await response.json();
      await fetchTeamMembers(teamId); // Обновляем список участников
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка изменения роли участника');
      throw err;
    }
  };

  // Синхронизация с API
  const syncWithAPI = async () => {
    await fetchTeams();
  };

  // Загрузка команд при инициализации (только если пользователь авторизован)
  useEffect(() => {
    const token = getToken();
    
    // Проверяем, изменился ли пользователь
    checkAndClearState(token);
    
    if (token) {
      fetchTeams();
    } else {
      // Если нет токена, просто очищаем состояние
      clearState();
    }
    
    // Регистрируем слушатель для очистки состояния
    const unregister = registerStateListener(() => {
      clearState();
    });
    
    return () => {
      unregister();
    };
  }, [fetchTeams, clearState]);

  return {
    teams,
    teamMembers,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    inviteUser,
    fetchTeamMembers,
    removeMember,
    updateMemberRole,
    syncWithAPI,
    clearState
  };
};

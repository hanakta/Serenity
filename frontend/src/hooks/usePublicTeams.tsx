import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PublicTeam {
  id: string;
  name: string;
  description: string;
  color: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  project_count: number;
  task_count: number;
  owner_name: string;
  owner_email: string;
  owner_avatar: string | null;
  team_created_at: string;
  is_active: boolean;
}

export interface PublicTeamsResponse {
  success: boolean;
  message: string;
  data: PublicTeam[];
  timestamp: string;
}

export const usePublicTeams = () => {
  const [publicTeams, setPublicTeams] = useState<PublicTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение публичных команд
  const getPublicTeams = useCallback(async (limit = 20, offset = 0, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { search })
      });
      
      const response = await fetch(`${API_BASE_URL}/api/teams/public?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки публичных команд');
      }

      const data: PublicTeamsResponse = await response.json();
      
      if (data.success) {
        setPublicTeams(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Ошибка загрузки публичных команд');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки публичных команд';
      setError(errorMessage);
      console.error('Ошибка получения публичных команд:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Присоединение к публичной команде
  const joinPublicTeam = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка присоединения к команде');
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем список публичных команд
        await getPublicTeams();
        return data;
      } else {
        throw new Error(data.message || 'Ошибка присоединения к команде');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка присоединения к команде';
      setError(errorMessage);
      console.error('Ошибка присоединения к команде:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getPublicTeams]);

  // Поиск публичных команд
  const searchPublicTeams = useCallback(async (searchTerm: string) => {
    return await getPublicTeams(20, 0, searchTerm);
  }, [getPublicTeams]);

  return {
    publicTeams,
    loading,
    error,
    getPublicTeams,
    joinPublicTeam,
    searchPublicTeams,
    setError
  };
};













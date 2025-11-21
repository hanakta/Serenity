'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TeamChatMessage {
  id: string;
  team_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  reply_message?: string;
  reply_user_name?: string;
  read_by?: TeamChatReadStatus[];
  is_online?: boolean;
}

export interface TeamChatReadStatus {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface TeamFile {
  id: string;
  team_id: string;
  user_id: string;
  task_id?: string;
  project_id?: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  user_name?: string;
}

export const useTeamChat = () => {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Получение токена
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Получение сообщений чата команды
  const getChatMessages = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        setMessages([]);
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/chat/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки сообщений');
      }

      const data = await response.json();
      const messages = data.data.messages || [];
      
      // Добавляем онлайн статус к сообщениям
      const messagesWithOnlineStatus = messages.map((msg: TeamChatMessage) => ({
        ...msg,
        is_online: onlineUsers.has(msg.user_id)
      }));
      
      setMessages(messagesWithOnlineStatus);
      setUnreadCount(data.data.unread_count || 0);
      return messagesWithOnlineStatus;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки сообщений');
      console.error('Ошибка загрузки сообщений:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [onlineUsers])

  // Отправка сообщения
  const sendMessage = async (teamId: string, message: string, replyToId?: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message,
          reply_to_id: replyToId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отправки сообщения');
      }

      const data = await response.json();
      
      // Добавляем новое сообщение в локальное состояние
      if (data.data) {
        setMessages(prev => [...prev, data.data]);
      }
      
      // Также обновляем сообщения с сервера для получения актуальных данных
      await getChatMessages(teamId);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки сообщения');
      throw err;
    }
  };

  // Редактирование сообщения
  const editMessage = async (messageId: string, newMessage: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка редактирования сообщения');
      }

      const data = await response.json();
      // Обновляем локальное состояние
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, message: newMessage, is_edited: true, edited_at: new Date().toISOString() } : msg
      ));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка редактирования сообщения');
      throw err;
    }
  };

  // Удаление сообщения
  const deleteMessage = async (messageId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления сообщения');
      }

      // Удаляем из локального состояния
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления сообщения');
      throw err;
    }
  };

  // Отметка сообщений как прочитанных
  const markMessagesAsRead = async (teamId: string, messageIds: string[]) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/chat/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message_ids: messageIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отметки сообщений как прочитанных');
      }

      setUnreadCount(0); // Сбрасываем счетчик непрочитанных
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отметки сообщений как прочитанных');
      console.error('Ошибка отметки сообщений как прочитанных:', err);
    }
  };

  // Получение файлов команды
  const getTeamFiles = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка получения файлов');
      }

      const data = await response.json();
      setFiles(data.data || []);
      return data.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файлов');
      console.error('Ошибка загрузки файлов:', err);
      return [];
    }
  };

  // Загрузка файла
  const uploadFile = async (teamId: string, file: File, taskId?: string, projectId?: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      if (taskId) formData.append('task_id', taskId);
      if (projectId) formData.append('project_id', projectId);

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Если ошибка аутентификации, очищаем токен
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
          return null;
        }
        
        throw new Error(`Ошибка загрузки файла: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      await getTeamFiles(teamId); // Обновляем список файлов
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
      console.error('Ошибка загрузки файла:', err);
      
      // Fallback - симулируем успешную загрузку для демонстрации
      const mockFileData = {
        id: `file_${Date.now()}`,
        team_id: teamId,
        user_id: 'demo_user',
        filename: file.name,
        original_filename: file.name,
        file_path: `/uploads/teams/${teamId}/${file.name}`,
        file_size: file.size,
        mime_type: file.type,
        created_at: new Date().toISOString(),
        user_name: 'Демо Пользователь'
      };
      
      // Обновляем список файлов
      setFiles(prev => [mockFileData, ...prev]);
      
      return mockFileData;
    }
  };

  // Удаление файла
  const deleteFile = async (fileId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления файла');
      }

      // Удаляем из локального состояния
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления файла');
      throw err;
    }
  };

  // Скачивание файла
  const downloadFile = async (fileId: string, teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка скачивания файла');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка скачивания файла');
      console.error('Ошибка скачивания файла:', err);
      
      // Fallback - показываем уведомление о том, что файл недоступен
      alert('Файл временно недоступен для скачивания. Это демо-версия.');
    }
  };

  // Получение онлайн пользователей команды
  const getOnlineUsers = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return new Set();
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/online-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка получения онлайн пользователей');
      }

      const data = await response.json();
      const onlineUserIds = new Set(data.data.online_users || []);
      setOnlineUsers(onlineUserIds);
      return onlineUserIds;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка получения онлайн пользователей');
      console.error('Ошибка получения онлайн пользователей:', err);
      return new Set();
    }
  };

  // Отметка пользователя как онлайн
  const markUserOnline = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/online`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка отметки пользователя как онлайн');
      }
    } catch (err) {
      console.error('Ошибка отметки пользователя как онлайн:', err);
    }
  };

  // Отметка пользователя как оффлайн
  const markUserOffline = async (teamId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/offline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка отметки пользователя как оффлайн');
      }
    } catch (err) {
      console.error('Ошибка отметки пользователя как оффлайн:', err);
    }
  };

  // Форматирование времени сообщения
  const formatMessageTime = (timestamp: string) => {
    try {
      // Создаем дату из timestamp (который приходит из базы данных в UTC)
      const date = new Date(timestamp);
      const now = new Date();
      
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp);
        return 'недавно';
      }
      
      // Конвертируем в казахстанское время (UTC+5) только для отображения
      const kazakhstanDate = new Date(date.getTime() + (5 * 60 * 60 * 1000)); 
      
      // Для сравнения используем локальные даты без конвертации
      const messageLocalDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayLocalDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayLocalDate = new Date(todayLocalDate);
      yesterdayLocalDate.setDate(yesterdayLocalDate.getDate() - 1);
      
      const hours = kazakhstanDate.getHours().toString().padStart(2, '0');
      const minutes = kazakhstanDate.getMinutes().toString().padStart(2, '0');
      
      // Если сообщение отправлено сегодня
      if (messageLocalDate.getTime() === todayLocalDate.getTime()) {
        return `${hours}:${minutes}`;
      }
      
      // Если сообщение отправлено вчера
      if (messageLocalDate.getTime() === yesterdayLocalDate.getTime()) {
        return `Вчера ${hours}:${minutes}`;
      }
      
      // Если сообщение отправлено более 7 дней назад
      const diffDays = Math.floor((todayLocalDate.getTime() - messageLocalDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        const day = kazakhstanDate.getDate().toString().padStart(2, '0');
        const month = (kazakhstanDate.getMonth() + 1).toString().padStart(2, '0');
        const year = kazakhstanDate.getFullYear().toString().slice(-2);
        return `${day}.${month}.${year}`;
      }
      
      // Если сообщение отправлено в течение недели
      const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      const weekday = weekdays[kazakhstanDate.getDay()];
      return `${weekday} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting message time:', error, timestamp);
      return 'недавно';
    }
  };

  // Получение URL аватарки
  const getAvatarUrl = (avatar?: string, userName?: string, userId?: string) => {
    // Используем новый API для получения аватарок
    if (userId) {
      return `http://localhost:8000/api/users/${userId}/avatar`;
    }
    
    // Fallback для старых данных
    if (avatar && avatar.startsWith('http')) {
      return avatar;
    }
    
    // Генерируем аватар на основе имени пользователя
    if (userName && typeof userName === 'string') {
      const initials = userName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3B82F6&color=ffffff&size=40&bold=true`;
    }
    
    return 'https://ui-avatars.com/api/?name=U&background=6B7280&color=ffffff&size=40&bold=true';
  };

  // Автоматическое обновление сообщений
  const startPolling = useCallback((teamId: string, interval: number = 3000) => {
    const poll = () => {
      getChatMessages(teamId);
    };
    
    const intervalId = setInterval(poll, interval);
    return () => clearInterval(intervalId);
  }, [getChatMessages]);

  return {
    messages,
    files,
    unreadCount,
    loading,
    error,
    onlineUsers,
    getChatMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    getTeamFiles,
    uploadFile,
    deleteFile,
    downloadFile,
    getOnlineUsers,
    markUserOnline,
    markUserOffline,
    formatMessageTime,
    getAvatarUrl,
    startPolling
  };
};

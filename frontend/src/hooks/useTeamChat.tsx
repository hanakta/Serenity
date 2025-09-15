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
  }, [])

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
      await getChatMessages(teamId); // Обновляем сообщения
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
      // Временно возвращаем пустой массив, так как endpoint не реализован
      setFiles([]);
      return [];
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка загрузки файла');
      }

      const data = await response.json();
      await getTeamFiles(teamId); // Обновляем список файлов
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
      throw err;
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
  const downloadFile = async (fileId: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, {
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
      throw err;
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
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Если сообщение отправлено сегодня
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Если сообщение отправлено вчера
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера ' + date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Если сообщение отправлено более 7 дней назад
    if (diff > 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      });
    }
    
    // Если сообщение отправлено в течение недели
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
    formatMessageTime
  };
};

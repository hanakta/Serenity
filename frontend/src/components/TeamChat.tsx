'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTeamChat, TeamChatMessage } from '@/hooks/useTeamChat';
import { formatMessageTime } from '@/hooks/useTeamChat';

interface TeamChatProps {
  teamId: string;
}

export const TeamChat: React.FC<TeamChatProps> = ({ teamId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    unreadCount,
    loading,
    error,
    onlineUsers,
    getChatMessages,
    sendMessage,
    markMessagesAsRead,
    getOnlineUsers,
    markUserOnline,
    markUserOffline,
    formatMessageTime,
    startPolling
  } = useTeamChat();

  // Загрузка сообщений при монтировании компонента
  useEffect(() => {
    if (teamId) {
      getChatMessages(teamId);
      getOnlineUsers(teamId);
      markUserOnline(teamId);
      
      // Запускаем автоматическое обновление сообщений
      const stopPolling = startPolling(teamId, 3000); // Обновляем каждые 3 секунды
      
      // Отметка пользователя как оффлайн при размонтировании
      return () => {
        markUserOffline(teamId);
        stopPolling(); // Останавливаем polling
      };
    }
  }, [teamId, getChatMessages, getOnlineUsers, markUserOnline, markUserOffline, startPolling]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отметка сообщений как прочитанных при просмотре
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => !msg.read_by?.some(read => read.user_id === getCurrentUserId()))
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(teamId, unreadMessageIds);
      }
    }
  }, [messages, teamId]);

  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.user_id;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(teamId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getAvatarUrl = (avatar?: string, userName?: string, userId?: string) => {
    // Используем новый API для получения аватарок
    if (userId) {
      return `http://localhost:8000/api/users/${userId}/avatar`;
    }
    
    // Fallback для старых данных
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:8000/api/users/${userId}/avatar`;
    }
    
    // Генерируем аватар на основе имени пользователя
    if (userName && typeof userName === 'string') {
      const initials = userName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3B82F6&color=ffffff&size=40`;
    }
    
    return 'https://ui-avatars.com/api/?name=U&background=6B7280&color=ffffff&size=40';
  };

  const getReadStatus = (message: TeamChatMessage) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId || message.user_id === currentUserId) return null;
    
    const readBy = message.read_by || [];
    const readCount = readBy.length;
    const totalMembers = onlineUsers.size + 1; // +1 для текущего пользователя
    
    if (readCount === 0) return { status: 'unread', count: 0 };
    if (readCount === totalMembers - 1) return { status: 'read', count: readCount };
    return { status: 'partial', count: readCount };
  };

  // Группировка сообщений по времени
  const groupMessagesByTime = (messages: TeamChatMessage[]) => {
    const groups: { [key: string]: TeamChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Вчера';
      } else {
        groupKey = date.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(message);
    });
    
    return groups;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Заголовок чата */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ч</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Чат команды</h3>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {Array.from(onlineUsers).slice(0, 3).map((userId) => (
                    <div
                      key={userId}
                      className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      title="Онлайн"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {onlineUsers.size} участников онлайн
                </span>
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupMessagesByTime(messages)).map(([dateGroup, groupMessages]) => (
          <div key={dateGroup}>
            {/* Заголовок даты */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {dateGroup}
              </div>
            </div>
            
            {/* Сообщения группы */}
            <div className="space-y-2">
              {groupMessages.map((message, index) => {
                const isOwnMessage = message.user_id === getCurrentUserId();
                const readStatus = getReadStatus(message);
                
                // Проверяем, нужно ли показать аватар
                const prevMessage = index > 0 ? groupMessages[index - 1] : null;
                const showAvatar = !isOwnMessage && (
                  !prevMessage || 
                  prevMessage.user_id !== message.user_id ||
                  new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000 // 5 минут
                );
                
                // Проверяем, нужно ли показать имя пользователя
                const showUserName = !isOwnMessage && showAvatar;
                
                return (
                  <div key={message.id} className="flex flex-col">
                    {/* Имя пользователя */}
                    {showUserName && (
                      <div className="flex items-center mb-1 px-2">
                        <img
                          src={getAvatarUrl(message.user_avatar, message.user_name, message.user_id)}
                          alt={message.user_name || 'Пользователь'}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {message.user_name}
                        </span>
                      </div>
                    )}
                    
                    {/* Сообщение */}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`flex items-end max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Аватар */}
                        {showAvatar && (
                          <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
                            <img
                              src={getAvatarUrl(message.user_avatar, message.user_name, message.user_id)}
                              alt={message.user_name || 'Пользователь'}
                              className="w-6 h-6 rounded-full"
                            />
                          </div>
                        )}
                        
                        {/* Пустое место для выравнивания, если аватар не показывается */}
                        {!showAvatar && !isOwnMessage && (
                          <div className="w-8 flex-shrink-0"></div>
                        )}
                        
                        {/* Контент сообщения */}
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl max-w-full ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            {message.reply_to_id && (
                              <div className={`text-xs mb-2 p-2 rounded-lg ${
                                isOwnMessage ? 'bg-blue-600' : 'bg-gray-200'
                              }`}>
                                <div className="font-medium">
                                  {message.reply_user_name}
                                </div>
                                <div className="truncate">
                                  {message.reply_message}
                                </div>
                              </div>
                            )}
                            
                            <div className="whitespace-pre-wrap break-words">{message.message}</div>
                            
                            {message.is_edited && (
                              <div className="text-xs opacity-75 mt-1">
                                (изменено)
                              </div>
                            )}
                          </div>
                          
                          {/* Время и статус прочтения */}
                          <div className={`flex items-center mt-1 space-x-1 ${
                            isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.created_at)}
                            </span>
                            
                            {isOwnMessage && readStatus && (
                              <div className="flex items-center">
                                {readStatus.status === 'read' && (
                                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {readStatus.status === 'partial' && (
                                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                )}
                                {readStatus.status === 'unread' && (
                                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-3 border-t bg-white rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Сообщение"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              {/* Кнопка эмодзи (заглушка) */}
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="flex-shrink-0 w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 px-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

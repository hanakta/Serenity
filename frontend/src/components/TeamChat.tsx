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
    formatMessageTime
  } = useTeamChat();

  // Загрузка сообщений при монтировании компонента
  useEffect(() => {
    if (teamId) {
      getChatMessages(teamId);
      getOnlineUsers(teamId);
      markUserOnline(teamId);
    }
    
    // Отметка пользователя как оффлайн при размонтировании
    return () => {
      if (teamId) {
        markUserOffline(teamId);
      }
    };
  }, [teamId]);

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

  const getAvatarUrl = (avatar?: string, userName?: string) => {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `/api/avatars/${avatar}`;
    }
    
    // Генерируем аватар на основе имени пользователя
    if (userName) {
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
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Чат команды</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {Array.from(onlineUsers).slice(0, 3).map((userId) => (
              <div
                key={userId}
                className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"
                title="Онлайн"
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {onlineUsers.size} онлайн
          </span>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.user_id === getCurrentUserId();
          const readStatus = getReadStatus(message);
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Аватар */}
                {!isOwnMessage && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(message.user_avatar, message.user_name)}
                        alt={message.user_name || 'Пользователь'}
                        className="w-8 h-8 rounded-full"
                      />
                      {message.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Сообщение */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {!isOwnMessage && (
                    <div className="text-xs text-gray-500 mb-1">
                      {message.user_name}
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.reply_to_id && (
                      <div className={`text-xs mb-2 p-2 rounded ${
                        isOwnMessage ? 'bg-blue-700' : 'bg-gray-200'
                      }`}>
                        <div className="font-medium">
                          {message.reply_user_name}
                        </div>
                        <div className="truncate">
                          {message.reply_message}
                        </div>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap">{message.message}</div>
                    
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
                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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

                {/* Аватар для собственных сообщений */}
                {isOwnMessage && (
                  <div className="flex-shrink-0 ml-3">
                    <img
                      src={getAvatarUrl(message.user_avatar, message.user_name)}
                      alt={message.user_name || 'Вы'}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

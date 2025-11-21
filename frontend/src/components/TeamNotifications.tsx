'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  UserPlus,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TeamNotification {
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
  user_name?: string;
  user_avatar?: string;
}

interface TeamNotificationsProps {
  teamId: string;
  notifications: TeamNotification[];
  loading: boolean;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
}

export default function TeamNotifications({
  teamId,
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}: TeamNotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.is_read;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'task_updated':
      case 'task_completed':
        return <CheckSquare className="w-5 h-5" />;
      case 'comment_added':
        return <MessageSquare className="w-5 h-5" />;
      case 'file_uploaded':
        return <FileText className="w-5 h-5" />;
      case 'member_joined':
      case 'member_left':
        return <UserPlus className="w-5 h-5" />;
      case 'project_updated':
        return <FileText className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'task_assigned':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'comment_added':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'file_uploaded':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'member_joined':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'member_left':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-white/70 bg-white/10 border-white/20';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    return `${Math.floor(diffInSeconds / 86400)} дн назад`;
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const notificationId of selectedNotifications) {
      await onMarkAsRead(notificationId);
    }
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    for (const notificationId of selectedNotifications) {
      await onDelete(notificationId);
    }
    setSelectedNotifications(new Set());
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-white/70">Загрузка уведомлений...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Уведомления команды</h3>
          <p className="text-white/70">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все уведомления прочитаны'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <motion.button
            onClick={onMarkAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="w-4 h-4" />
            <span>Отметить все как прочитанные</span>
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Все ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'unread'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Непрочитанные ({unreadCount})
          </button>
        </div>

        {selectedNotifications.size > 0 && (
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleBulkMarkAsRead}
              className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="w-3 h-3" />
              <span>Прочитать ({selectedNotifications.size})</span>
            </motion.button>
            <motion.button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-3 h-3" />
              <span>Удалить ({selectedNotifications.size})</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  y: -2, 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
                className={`bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-4 border transition-all duration-300 cursor-pointer group ${
                  notification.is_read 
                    ? 'border-white/10 hover:border-white/20' 
                    : 'border-blue-500/30 hover:border-blue-500/50'
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <motion.input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectNotification(notification.id);
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                    whileTap={{ scale: 0.9 }}
                  />

                  {/* Icon */}
                  <motion.div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getNotificationColor(notification.type)}`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getNotificationIcon(notification.type)}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-base mb-1 ${
                          notification.is_read ? 'text-white/80' : 'text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          notification.is_read ? 'text-white/60' : 'text-white/80'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Data */}
                        {notification.data && (
                          <div className="flex items-center space-x-2 text-xs text-white/50">
                            {notification.data.task_id && (
                              <span className="px-2 py-1 bg-blue-500/20 rounded-full">
                                Задача #{notification.data.task_id.slice(-8)}
                              </span>
                            )}
                            {notification.data.project_id && (
                              <span className="px-2 py-1 bg-purple-500/20 rounded-full">
                                Проект #{notification.data.project_id.slice(-8)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-white/50 text-xs">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        
                        {!notification.is_read && (
                          <motion.div 
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                          className="p-1 text-white/30 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {filter === 'unread' ? 'Нет непрочитанных уведомлений' : 'Нет уведомлений'}
              </h3>
              <p className="text-white/70">
                {filter === 'unread' 
                  ? 'Все уведомления прочитаны' 
                  : 'Уведомления команды появятся здесь'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

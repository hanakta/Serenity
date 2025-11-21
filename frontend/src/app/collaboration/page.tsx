'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTeams } from '@/hooks/useTeams';
import { useTeamChat } from '@/hooks/useTeamChat';
import { useTeamActivity } from '@/hooks/useTeamActivity';
import { useTeamTasks } from '@/hooks/useTeamTasks';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  Activity, 
  Send,
  ArrowLeft,
  Search,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Upload,
  Settings,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Check,
  X,
  Edit,
  Trash2,
  CheckSquare,
  UserPlus,
  Mail,
  Plus
} from 'lucide-react';
import { InviteTeamMemberModal } from '@/components/InviteTeamMemberModal';
import { TeamInvitations } from '@/components/TeamInvitations';
import TeamTaskModal from '@/components/TeamTaskModal';
import TeamNotifications from '@/components/TeamNotifications';
import AddActivityModal from '@/components/AddActivityModal';
import { InvitationsList } from '@/components/InvitationsList';
import { useManualActivity } from '@/hooks/useManualActivity';

interface CollaborationActivity {
  id: string;
  activity_type: string;
  activity_data: {
    task_title?: string;
    project_name?: string;
    file_name?: string;
    [key: string]: unknown;
  };
  target_id?: string;
  target_type?: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  message_type: string;
  reply_to_id?: string;
  is_edited: boolean;
  edited_at?: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
  updated_at: string;
  reply_message?: string;
  reply_user_name?: string;
}

interface TeamFile {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  user_name: string;
  created_at: string;
}

export default function CollaborationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { teams } = useTeams();
  const { messages, files, unreadCount, getChatMessages, sendMessage, uploadFile, downloadFile, getTeamFiles, startPolling, formatMessageTime, getAvatarUrl } = useTeamChat();
  const { activities, notifications, getTeamActivity, getTeamNotifications, error: activityError, demoMode } = useTeamActivity();
  const { teamTasks, teamProjects, getTeamTasks, getTeamProjects, createTeamTask } = useTeamTasks();
  const { createManualActivity, loading: manualActivityLoading } = useManualActivity();
  
  const [activeTab, setActiveTab] = useState<'activity' | 'comments' | 'files' | 'tasks' | 'invitations' | 'notifications' | 'settings'>('activity');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      chatMessages: true,
      teamActivity: true,
      fileUploads: false,
      mentions: true
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      showLastSeen: false
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      showAvatars: true
    },
    team: {
      name: '',
      description: '',
      color: '#3B82F6',
      allowMemberInvites: true,
      requireApproval: false
    }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Проверяем токен при загрузке страницы (мягкая проверка)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !isLoading) {
      // Только если пользователь не загружается, показываем ошибку
      console.warn('Токен не найден, но пользователь может быть в процессе загрузки');
    }
  }, [isLoading]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
    }
  }, [teams, selectedTeam]);

  const loadTeamData = useCallback(async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      if (activeTab === 'activity') {
        await getTeamActivity(selectedTeam.id);
      } else if (activeTab === 'comments') {
        await getChatMessages(selectedTeam.id);
        // Запускаем автоматическое обновление для чата
        startPolling(selectedTeam.id, 3000);
      } else if (activeTab === 'files') {
        await getTeamFiles(selectedTeam.id);
      } else if (activeTab === 'tasks') {
        await getTeamTasks(selectedTeam.id);
        await getTeamProjects(selectedTeam.id);
      } else if (activeTab === 'notifications') {
        await getTeamNotifications(selectedTeam.id);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, activeTab, getTeamActivity, getChatMessages, getTeamFiles, getTeamTasks, getTeamProjects, getTeamNotifications, startPolling]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData();
      if (activeTab === 'settings') {
        // loadTeamSettings();
      }
    }
  }, [selectedTeam, activeTab]);

  // Автоматический скролл к последнему сообщению
  useEffect(() => {
    if (activeTab === 'comments' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTeam) return;

    try {
      // Простая отправка сообщения без возврата значения
      sendMessage(selectedTeam.id, newMessage).then(() => {
        setNewMessage('');
      }).catch((error) => {
        console.error('Ошибка отправки сообщения:', error);
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const formatActivityType = (type: string, activityData?: any) => {
    // Если это ручная активность (comment_added с created_manually), показываем специальный текст
    if (type === 'comment_added' && activityData?.created_manually) {
      return 'Добавил активность';
    }
    
    const types: { [key: string]: string } = {
      'task_created': 'Создал задачу',
      'task_updated': 'Обновил задачу',
      'task_completed': 'Завершил задачу',
      'project_created': 'Создал проект',
      'project_updated': 'Обновил проект',
      'comment_added': 'Добавил комментарий',
      'file_uploaded': 'Загрузил файл',
      'meeting_scheduled': 'Запланировал встречу'
    };
    return types[type] || type;
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      // Убеждаемся, что дата правильно парсится
      const date = new Date(dateString);
      const now = new Date();
      
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'недавно';
      }
      
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'только что';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
      return `${Math.floor(diffInSeconds / 86400)} дн назад`;
    } catch (error) {
      console.error('Error formatting time:', error, dateString);
      return 'недавно';
    }
  };

  const handleCreateManualActivity = async (data: { title: string; description: string; category: string }) => {
    if (!selectedTeam) return;
    
    try {
      await createManualActivity(selectedTeam.id, data);
      setShowAddActivityModal(false);
      await loadTeamData();
    } catch (error) {
      console.error('Ошибка создания активности:', error);
    }
  };

  // Группировка сообщений по времени
  const groupMessagesByTime = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const filteredActivities = activities.filter(activity => {
    const searchText = searchQuery.toLowerCase();
    const matchesSearch = 
      (activity.activity_data?.task_title as string)?.toLowerCase().includes(searchText) ||
      (activity.activity_data?.title as string)?.toLowerCase().includes(searchText) ||
      (activity.activity_data?.description as string)?.toLowerCase().includes(searchText) ||
      (activity.user_name || 'Неизвестный пользователь').toLowerCase().includes(searchText);
    const matchesFilter = filterType === 'all' || activity.activity_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-white font-bold text-3xl">S</span>
          </motion.div>
          <div className="text-white text-2xl font-medium">Загрузка...</div>
        </motion.div>
      </div>
    );
  }

  // Показываем ошибку аутентификации, если есть проблемы с токеном
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Ошибка аутентификации</h2>
            <p className="text-gray-300 mb-4">
              Для доступа к коллаборации необходимо войти в систему.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Войти в систему
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Индикатор демо режима */}
      {demoMode && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-300">Демо режим: отображаются примеры данных</span>
              <button
                onClick={() => router.push('/login')}
                className="ml-auto bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Войти для полного доступа
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Отображение ошибок аутентификации */}
      {activityError && !demoMode && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-300">{activityError}</span>
              <button
                onClick={() => router.push('/login')}
                className="ml-auto bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.back()}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-white">Коллаборация</h1>
                <p className="text-sm text-white/70">
                  {selectedTeam ? selectedTeam.name : 'Выберите команду'}
                </p>
              </div>
            </div>

            {/* Team Selector */}
            {teams.length > 1 ? (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-white/70" />
                <select
                  value={selectedTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === e.target.value);
                    if (team) {
                      setSelectedTeam(team);
                    }
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id} className="bg-slate-800">
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'activity', label: 'Активность', icon: Activity },
            { id: 'comments', label: 'Чат', icon: MessageSquare },
            { id: 'tasks', label: 'Задачи', icon: CheckSquare },
            { id: 'invitations', label: 'Приглашения', icon: UserPlus },
            { id: 'files', label: 'Файлы', icon: Archive },
            { id: 'notifications', label: 'Уведомления', icon: Bell },
            { id: 'settings', label: 'Настройки', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
          >
            {activeTab === 'activity' && (
              <div className="p-6">
                {/* Header with Add Button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Активность команды</h2>
                  <motion.button
                    onClick={() => setShowAddActivityModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить активность</span>
                  </motion.button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      placeholder="Поиск по активности..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-slate-800">Все типы</option>
                    <option value="task_created" className="bg-slate-800">Создание задач</option>
                    <option value="task_updated" className="bg-slate-800">Обновление задач</option>
                    <option value="task_completed" className="bg-slate-800">Завершение задач</option>
                    <option value="comment_added" className="bg-slate-800">Комментарии</option>
                    <option value="file_uploaded" className="bg-slate-800">Файлы</option>
                    <option value="manual_activity" className="bg-slate-800">Ручные активности</option>
                  </select>
                </div>

                {/* Activities */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center py-8">
                      <motion.div
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-white/70">Загрузка активности...</p>
                    </div>
                  ) : filteredActivities.length > 0 ? (
                    filteredActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ 
                          y: -4, 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start space-x-4">
                          <motion.div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300 overflow-hidden"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <img
                              src={`http://localhost:8000/api/users/${activity.user_id}/avatar`}
                              alt={activity.user_name || 'Пользователь'}
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.className = parent.className.replace('overflow-hidden', '') + ' bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';
                                  parent.textContent = (activity.user_name || 'Н').charAt(0);
                                }
                              }}
                            />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white text-base truncate">{activity.user_name || 'Неизвестный пользователь'}</span>
                                <motion.span 
                                  className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {formatTimeAgo(activity.created_at)}
                                </motion.span>
                              </div>
                              <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                                <span className="text-white/80 text-sm font-medium">{formatActivityType(activity.activity_type, activity.activity_data)}</span>
                              </div>
                              {/* Display task title for task activities */}
                              {(activity.activity_data as any)?.task_title && activity.activity_type !== 'manual_activity' && (
                                <motion.div 
                                  className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 border border-white/10"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <p className="text-white/90 text-sm font-medium truncate">
                                    &ldquo;{(activity.activity_data as any).task_title}&rdquo;
                                  </p>
                                </motion.div>
                              )}
                              {/* Display manual activity content */}
                              {activity.activity_type === 'comment_added' && (activity.activity_data as any)?.title && (activity.activity_data as any)?.created_manually && (
                                <motion.div 
                                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <p className="text-white/90 text-sm font-medium mb-2">
                                    {(activity.activity_data as any).title}
                                  </p>
                                  {(activity.activity_data as any).description && (
                                    <p className="text-white/70 text-xs leading-relaxed">
                                      {(activity.activity_data as any).description}
                                    </p>
                                  )}
                                  {(activity.activity_data as any).category && (
                                    <div className="mt-2">
                                      <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                        {(activity.activity_data as any).category}
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {searchQuery ? 'Активность не найдена' : 'Нет активности'}
                      </h3>
                      <p className="text-white/70">
                        {searchQuery 
                          ? 'Попробуйте изменить поисковый запрос'
                          : 'Активность команды появится здесь'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 bg-slate-800/50 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Чат команды</h3>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                        {unreadCount} непрочитанных
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-800/30 to-slate-900/30">
                  {loading ? (
                    <div className="text-center py-8">
                      <motion.div
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-white/70">Загрузка сообщений...</p>
                    </div>
                  ) : messages.length > 0 ? (
                    Object.entries(groupMessagesByTime(messages)).map(([dateGroup, groupMessages]) => (
                      <div key={dateGroup}>
                        {/* Заголовок даты */}
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                            {dateGroup}
                          </div>
                        </div>
                        
                        {/* Сообщения группы */}
                        <div className="space-y-2">
                          {groupMessages.map((message, index) => {
                            const isOwnMessage = message.user_name === user?.name;
                            
                            // Проверяем, нужно ли показать аватар
                            const prevMessage = index > 0 ? groupMessages[index - 1] : null;
                            const showAvatar = !isOwnMessage && (
                              !prevMessage || 
                              prevMessage.user_name !== message.user_name ||
                              new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000 // 5 минут
                            );
                            
                            // Проверяем, нужно ли показать имя пользователя
                            const showUserName = !isOwnMessage && showAvatar;
                            
                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ 
                                  duration: 0.3, 
                                  delay: index * 0.05,
                                  ease: [0.25, 0.46, 0.45, 0.94]
                                }}
                                className="flex flex-col"
                              >
                                {/* Имя пользователя */}
                                {showUserName ? (
                                  <div className="flex items-center mb-1 px-2">
                                    <div className="w-5 h-5 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                                      {(message.user_name || 'Н').charAt(0)}
                                    </div>
                                    <span className="text-xs font-medium text-white/70">
                                      {message.user_name}
                                    </span>
                                  </div>
                                ) : null}
                                
                                {/* Сообщение */}
                                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
                                  <div className={`flex items-end max-w-sm lg:max-w-lg ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Аватар и имя пользователя */}
                                    {showAvatar ? (
                                      <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
                                        <div className="flex flex-col items-center">
                                          <img
                                            src={getAvatarUrl(message.user_avatar, message.user_name, message.user_id)}
                                            alt={message.user_name || 'Пользователь'}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                                            onError={(e) => {
                                              // Fallback to initials if image fails to load
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              const parent = target.parentElement;
                                              if (parent) {
                                                const userName = message.user_name || 'Н';
                                                const initials = typeof userName === 'string' 
                                                  ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                                  : '??';
                                                parent.innerHTML = `<div class="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white/20">${initials}</div>`;
                                              }
                                            }}
                                          />
                                          {!isOwnMessage ? (
                                            <span className="text-xs text-white/70 mt-1 max-w-[60px] truncate">
                                              {message.user_name || 'Пользователь'}
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                    ) : null}
                                    
                                    {/* Пустое место для выравнивания, если аватар не показывается */}
                                    {!showAvatar && !isOwnMessage ? (
                                      <div className="w-10 flex-shrink-0"></div>
                                    ) : null}
                                    
                                    {/* Контент сообщения */}
                                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                      <motion.div
                                        className={`px-4 py-3 rounded-2xl max-w-full ${
                                          isOwnMessage
                                            ? 'bg-blue-500 text-white rounded-br-md'
                                            : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-bl-md'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        {message.reply_to_id && message.reply_message ? (
                                          <div className={`text-xs mb-2 p-2 rounded-lg ${
                                            isOwnMessage ? 'bg-blue-600' : 'bg-white/10'
                                          }`}>
                                            <div className="font-medium">
                                              {message.reply_user_name}
                                            </div>
                                            <div className="truncate">
                                              {message.reply_message}
                                            </div>
                                          </div>
                                        ) : null}
                                        
                                        <div className="whitespace-pre-wrap break-words text-base leading-relaxed">
                                          {message.message}
                                        </div>
                                        
                                        {message.is_edited ? (
                                          <div className="text-xs opacity-75 mt-1">
                                            (изменено)
                                          </div>
                                        ) : null}
                                      </motion.div>
                                      
                                      {/* Время и статус */}
                                      <div className={`flex items-center mt-1 space-x-1 ${
                                        isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                                      }`}>
                                        <span className="text-xs text-white/50">
                                          {formatMessageTime(message.created_at)}
                                        </span>
                                        {isOwnMessage && (
                                          <span className="text-xs text-white/40">
                                            {message.user_name || 'Вы'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Нет сообщений</h3>
                      <p className="text-white/70">
                        Начните общение с участниками команды
                      </p>
                    </div>
                  )}
                  {/* Элемент для автоматического скролла */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10 bg-slate-800/50 backdrop-blur-xl">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <textarea
                          placeholder="Напишите сообщение..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
                          rows={1}
                          style={{
                            height: 'auto',
                            minHeight: '48px'
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                          }}
                        />
                        {/* Кнопка эмодзи */}
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-6">
                {/* File Upload Button */}
                <div className="mb-6">
                  <motion.label
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Загрузить файл</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && selectedTeam) {
                          try {
                            await uploadFile(selectedTeam.id, file);
                            // Обновляем список файлов
                            await getTeamFiles(selectedTeam.id);
                          } catch (error) {
                            console.error('Ошибка загрузки файла:', error);
                          }
                        }
                      }}
                      accept="*/*"
                    />
                  </motion.label>
                </div>

                {/* Files List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    <div className="col-span-full text-center py-8">
                      <motion.div
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-white/70">Загрузка файлов...</p>
                    </div>
                  ) : files.length > 0 ? (
                    files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ 
                          y: -4, 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-start space-x-4">
                            <motion.div 
                              className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300"
                              whileHover={{ rotate: 5, scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {getFileIcon(file.mime_type)}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-base truncate mb-2">{file.original_filename}</h4>
                              <div className="flex items-center space-x-3 text-sm text-white/70">
                                <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                                  {formatFileSize(file.file_size)}
                                </span>
                                <span>{formatTimeAgo(file.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(file.user_name || 'Н').charAt(0)}
                              </div>
                              <span className="text-white/70 text-sm">Загружен {file.user_name || 'Неизвестный пользователь'}</span>
                            </div>
                            <motion.button 
                              onClick={() => downloadFile(file.id, selectedTeam.id)}
                              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group-hover:bg-blue-500/20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Archive className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Нет файлов</h3>
                      <p className="text-white/70">
                        Файлы, загруженные участниками команды, появятся здесь
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="p-6">
                {/* Tasks Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Командные задачи</h3>
                    <p className="text-white/70">Управление задачами команды</p>
                  </div>
                  <motion.button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Создать задачу</span>
                  </motion.button>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <motion.div
                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-white/70">Загрузка задач...</p>
                    </div>
                  ) : Array.isArray(teamTasks) && teamTasks.length > 0 ? (
                    teamTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 hover:bg-white/15 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{task.title}</h4>
                            {task.description && (
                              <p className="text-white/70 text-sm mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-white/60">
                              <span className={`px-2 py-1 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                task.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {task.status === 'completed' ? 'Завершено' :
                                 task.status === 'in_progress' ? 'В работе' :
                                 task.status === 'pending' ? 'Ожидает' : 'Отменено'}
                              </span>
                              <span className={`px-2 py-1 rounded-full ${
                                task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {task.priority === 'urgent' ? 'Срочно' :
                                 task.priority === 'high' ? 'Высокий' :
                                 task.priority === 'medium' ? 'Средний' : 'Низкий'}
                              </span>
                              {task.due_date && (
                                <span>Срок: {new Date(task.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Нет задач</h3>
                      <p className="text-white/70">
                        Создайте первую задачу для команды
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'invitations' && (
              <div className="p-6">
                {/* Header with Invite Button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Приглашения</h2>
                    <p className="text-white/70">
                      Просматривайте входящие приглашения и приглашайте новых участников
                    </p>
                  </div>
                  {selectedTeam && (
                    <motion.button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail className="w-4 h-4" />
                      <span>Пригласить участника</span>
                    </motion.button>
                  )}
                </div>

                {/* Incoming Invitations */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Входящие приглашения</h3>
                  <InvitationsList />
                </div>

                {/* Team Invitations Management */}
                {selectedTeam && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Управление приглашениями команды</h3>
                    <TeamInvitations 
                      teamId={selectedTeam.id}
                      teamName={selectedTeam.name}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && selectedTeam && (
              <div className="p-6">
                <TeamNotifications
                  teamId={selectedTeam.id}
                  notifications={notifications}
                  loading={loading}
                  onMarkAsRead={async (notificationId) => {
                    // Здесь будет вызов API для отметки уведомления как прочитанного
                    console.log('Mark as read:', notificationId);
                  }}
                  onMarkAllAsRead={async () => {
                    // Здесь будет вызов API для отметки всех уведомлений как прочитанных
                    console.log('Mark all as read');
                  }}
                  onDelete={async (notificationId) => {
                    // Здесь будет вызов API для удаления уведомления
                    console.log('Delete notification:', notificationId);
                  }}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Настройки команды</h3>
                      <p className="text-white/70">Управляйте настройками и предпочтениями команды</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {settingsSaved && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Сохранено</span>
                        </div>
                      )}
                      <motion.button
                        disabled={settingsLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {settingsLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Сохранить</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Team Settings */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl"
                  >
                    <motion.div 
                      className="flex items-center space-x-4 mb-8"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h4 className="text-xl font-bold text-white">Информация о команде</h4>
                        <p className="text-white/70 text-sm">Основные настройки команды</p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-semibold text-white/90 mb-3">
                          Название команды
                        </label>
                        <motion.input
                          type="text"
                          value={settings.team.name}
                          onChange={(e) => setSettings(prev => ({ ...prev, team: { ...prev.team, name: e.target.value } }))}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300 shadow-lg"
                          placeholder="Введите название команды"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-semibold text-white/90 mb-3">
                          Цвет команды
                        </label>
                        <div className="flex items-center space-x-4">
                          <motion.input
                            type="color"
                            value={settings.team.color}
                            onChange={(e) => setSettings(prev => ({ ...prev, team: { ...prev.team, color: e.target.value } }))}
                            className="w-14 h-14 rounded-xl border-2 border-white/20 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          />
                          <motion.div
                            className="w-14 h-14 rounded-xl border-2 border-white/20 shadow-lg"
                            style={{ backgroundColor: settings.team.color }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div 
                      className="mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-sm font-semibold text-white/90 mb-3">
                        Описание команды
                      </label>
                      <motion.textarea
                        value={settings.team.description}
                        onChange={(e) => setSettings(prev => ({ ...prev, team: { ...prev.team, description: e.target.value } }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300 resize-none shadow-lg"
                        placeholder="Опишите цель и задачи команды"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Invite Team Member Modal */}
      {selectedTeam && (
        <InviteTeamMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          onInviteSent={() => {
            // Refresh team data if needed
            if (activeTab === 'invitations') {
              // The TeamInvitations component will refresh automatically
            }
          }}
        />
      )}

      {/* Team Task Modal */}
      {selectedTeam && (
        <TeamTaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          onCreateTask={async (taskData) => {
            await createTeamTask(selectedTeam.id, taskData);
            // Обновляем список задач
            await getTeamTasks(selectedTeam.id);
          }}
          projects={teamProjects}
        />
      )}

      {/* Add Activity Modal */}
      {selectedTeam && (
        <AddActivityModal
          isOpen={showAddActivityModal}
          onClose={() => setShowAddActivityModal(false)}
          onSubmit={handleCreateManualActivity}
          loading={manualActivityLoading}
        />
      )}
    </div>
  );
}

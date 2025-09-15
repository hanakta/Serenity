'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Mail
} from 'lucide-react';
import { InviteTeamMemberModal } from '@/components/InviteTeamMemberModal';
import { TeamInvitations } from '@/components/TeamInvitations';

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
  const { messages, files, unreadCount, getChatMessages, sendMessage, uploadFile, downloadFile } = useTeamChat();
  const { activities, notifications, getTeamActivity, getTeamNotifications } = useTeamActivity();
  const { teamTasks, teamProjects, getTeamTasks, getTeamProjects, createTeamTask } = useTeamTasks();
  
  const [activeTab, setActiveTab] = useState<'activity' | 'comments' | 'files' | 'tasks' | 'invitations' | 'settings'>('activity');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
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
      } else if (activeTab === 'files') {
        // await getTeamFiles(selectedTeam.id); // Временно отключено
      } else if (activeTab === 'tasks') {
        await getTeamTasks(selectedTeam.id);
        await getTeamProjects(selectedTeam.id);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam, activeTab]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData();
      if (activeTab === 'settings') {
        // loadTeamSettings();
      }
    }
  }, [selectedTeam, activeTab]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTeam) return;

    try {
      await sendMessage(selectedTeam.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const formatActivityType = (type: string) => {
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
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    return `${Math.floor(diffInSeconds / 86400)} дн назад`;
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
    const matchesSearch = activity.activity_data?.task_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.user_name.toLowerCase().includes(searchQuery.toLowerCase());
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
            {teams.length > 1 && (
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
            )}
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
                            className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {activity.user_name.charAt(0)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white text-base truncate">{activity.user_name}</span>
                                <motion.span 
                                  className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {formatTimeAgo(activity.created_at)}
                                </motion.span>
                              </div>
                              <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                                <span className="text-white/80 text-sm font-medium">{formatActivityType(activity.activity_type)}</span>
                              </div>
                              {activity.activity_data?.task_title && (
                                <motion.div 
                                  className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 border border-white/10"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <p className="text-white/90 text-sm font-medium truncate">
                                    &ldquo;{activity.activity_data.task_title}&rdquo;
                                  </p>
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
              <div className="flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Чат команды</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {unreadCount} непрочитанных
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className={`flex ${message.user_name === user?.name ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.user_name === user?.name ? 'order-2' : 'order-1'}`}>
                          {message.user_name !== user?.name && (
                            <motion.div 
                              className="flex items-center space-x-2 mb-2"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <motion.div 
                                className="w-7 h-7 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {message.user_name.charAt(0)}
                              </motion.div>
                              <span className="text-white/70 text-sm font-medium">{message.user_name}</span>
                            </motion.div>
                          )}
                          <motion.div
                            className={`p-4 rounded-2xl shadow-lg ${
                              message.user_name === user?.name
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            {message.reply_to_id && message.reply_message && (
                              <motion.div 
                                className="mb-3 p-3 bg-white/10 rounded-lg text-sm border-l-4 border-white/30"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                              >
                                <div className="text-white/70 text-xs font-medium">{message.reply_user_name}</div>
                                <div className="text-white/80 truncate">{message.reply_message}</div>
                              </motion.div>
                            )}
                            <p className="text-sm leading-relaxed">{message.message}</p>
                            {message.is_edited && (
                              <motion.p 
                                className="text-xs opacity-70 mt-2 italic"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.2 }}
                              >
                                (изменено)
                              </motion.p>
                            )}
                          </motion.div>
                          <motion.div 
                            className="text-white/50 text-xs mt-2 px-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                          >
                            {formatTimeAgo(message.created_at)}
                          </motion.div>
                        </div>
                      </motion.div>
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
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Напишите сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-6">
                {/* File Upload Button */}
                <div className="mb-6">
                  <motion.button
                    disabled
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Загрузить файл</span>
                  </motion.button>
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
                                {file.user_name.charAt(0)}
                              </div>
                              <span className="text-white/70 text-sm">Загружен {file.user_name}</span>
                            </div>
                            <motion.button 
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

            {activeTab === 'invitations' && selectedTeam && (
              <div className="p-6">
                {/* Invitations Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Управление приглашениями</h3>
                    <p className="text-white/70">Приглашайте новых участников в команду</p>
                  </div>
                  <motion.button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Пригласить участника</span>
                  </motion.button>
                </div>

                {/* Team Invitations Component */}
                <TeamInvitations 
                  teamId={selectedTeam.id}
                  teamName={selectedTeam.name}
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
    </div>
  );
}

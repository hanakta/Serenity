'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckSquare, 
  Clock, 
  Users, 
  Calendar, 
  Flag, 
  Tag, 
  User, 
  Folder,
  BarChart3,
  RefreshCw,
  Plus,
  Filter,
  Search,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { useTeamTasks, TeamTask, TeamProject, TeamStats } from '@/hooks/useTeamTasks';
import { Team } from '@/hooks/useTeams';
import { PRIORITY_ICONS, PRIORITY_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/utils';
import TeamTaskForm from './TeamTaskForm';

interface TeamTasksViewProps {
  team: Team;
  onClose: () => void;
}

export default function TeamTasksView({ team, onClose }: TeamTasksViewProps) {
  const { 
    teamTasks, 
    teamProjects, 
    teamStats, 
    loading, 
    error, 
    getTeamTasks, 
    getTeamProjects, 
    getTeamStats,
    createTeamTask,
    updateTeamTask,
    deleteTeamTask
  } = useTeamTasks();

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем данные команды при открытии
  useEffect(() => {
    if (team.id) {
      loadTeamData();
    }
  }, [team.id]);

  const loadTeamData = async () => {
    try {
      console.log('Загружаем данные для команды:', team.id);
      const [tasks, projects, stats] = await Promise.all([
        getTeamTasks(team.id),
        getTeamProjects(team.id),
        getTeamStats(team.id)
      ]);
      console.log('Загруженные задачи:', tasks);
      console.log('Загруженные проекты:', projects);
      console.log('Загруженная статистика:', stats);
    } catch (err) {
      console.error('Ошибка загрузки данных команды:', err);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTeamTask(team.id, taskData);
      setShowCreateTaskModal(false);
      // Перезагружаем данные
      await loadTeamData();
    } catch (err) {
      console.error('Ошибка создания задачи:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<TeamTask>) => {
    try {
      await updateTeamTask(taskId, updates);
      // Перезагружаем данные
      await loadTeamData();
    } catch (err) {
      console.error('Ошибка обновления задачи:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        await deleteTeamTask(taskId);
        // Перезагружаем данные
        await loadTeamData();
      } catch (err) {
        console.error('Ошибка удаления задачи:', err);
      }
    }
  };

  // Фильтрация задач
  const filteredTasks = teamTasks
    .filter(task => task.team_id === team.id)
    .filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'urgent': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4 sm:mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Users className="w-6 h-6 text-blue-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Задачи команды &quot;{team.name}&quot;
                    </h2>
                    <p className="text-slate-400 mt-1">
                      {filteredTasks.length} задач • {teamProjects.filter(p => p.team_id === team.id).length} проектов
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={loadTeamData}
                    disabled={loading}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </motion.button>
                  <motion.button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    Создать задачу
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col px-6 py-6">
              {/* Статистика */}
              {teamStats && (
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-300">Всего задач</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{teamStats.tasks.total}</p>
                  </motion.div>
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-gray-300">В работе</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{teamStats.tasks.in_progress}</p>
                  </motion.div>
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Завершено</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{teamStats.tasks.completed}</p>
                  </motion.div>
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-red-400" />
                      <span className="text-sm text-gray-300">Просрочено</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{teamStats.tasks.overdue}</p>
                  </motion.div>
                </motion.div>
              )}

              {/* Фильтры и поиск */}
              <motion.div 
                className="flex flex-col md:flex-row gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск задач..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все статусы</option>
                    <option value="pending">К выполнению</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершено</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все приоритеты</option>
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
              </motion.div>

              {/* Список задач */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : error ? (
                  <motion.div 
                    className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  </motion.div>
                ) : filteredTasks.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div 
                      className="w-24 h-24 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-slate-700/30"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <CheckSquare className="w-12 h-12 text-slate-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3">Нет задач</h3>
                    <p className="text-slate-400 mb-8 text-base max-w-sm mx-auto">
                      Создайте первую задачу для команды и начните совместную работу
                    </p>
                    <motion.button
                      onClick={() => setShowCreateTaskModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      Создать задачу
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {filteredTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-white text-lg">{task.title}</h3>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status === 'pending' ? 'К выполнению' : 
                                 task.status === 'in_progress' ? 'В работе' : 
                                 task.status === 'completed' ? 'Завершено' : 'Отменено'}
                              </Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {PRIORITY_ICONS[task.priority]} {PRIORITY_LABELS[task.priority]}
                              </Badge>
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{task.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{task.user_name || 'Неизвестно'}</span>
                              </div>
                              {task.project_name && (
                                <div className="flex items-center space-x-1">
                                  <Folder className="w-4 h-4" />
                                  <span>{task.project_name}</span>
                                </div>
                              )}
                              {task.due_date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(task.due_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {task.status !== 'completed' && (
                              <motion.button
                                onClick={() => handleUpdateTask(task.id, { status: 'completed', completed_at: new Date().toISOString() })}
                                className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-all duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-lg transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Модальное окно создания задачи */}
      {showCreateTaskModal && (
        <TeamTaskForm
          teamId={team.id}
          teamName={team.name}
          teamProjects={teamProjects.filter(p => p.team_id === team.id)}
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onSave={handleCreateTask}
        />
      )}
    </AnimatePresence>
  );
}

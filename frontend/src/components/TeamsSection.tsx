'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Settings, Crown, UserPlus, MessageSquare, Calendar, BarChart3, Trash2, Edit, CheckSquare, FolderPlus, RefreshCw } from 'lucide-react';
import { useTeams, Team } from '@/hooks/useTeams';
import { useTeamTasks } from '@/hooks/useTeamTasks';
import CreateTeamModal from './CreateTeamModal';
import InviteUserModal from './InviteUserModal';
import TeamTaskForm from './TeamTaskForm';
import TeamTasksView from './TeamTasksView';

interface TeamsSectionProps {
  className?: string;
}

const TeamsSection: React.FC<TeamsSectionProps> = ({ className = '' }) => {
  const { teams, loading, error, createTeam, deleteTeam, joinTeam, syncWithAPI } = useTeams();
  const { createTeamTask, getTeamProjects, teamProjects } = useTeamTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTasksView, setShowTasksView] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleCreateTeam = () => {
    setShowCreateModal(true);
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await joinTeam(teamId);
    } catch (err) {
      console.error('Ошибка присоединения к команде:', err);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту команду?')) {
      try {
        await deleteTeam(teamId);
      } catch (err) {
        console.error('Ошибка удаления команды:', err);
      }
    }
  };

  const handleInviteUser = (team: Team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
  };

  const handleCreateTask = async (team: Team) => {
    setSelectedTeam(team);
    // Загружаем проекты команды перед открытием модального окна
    try {
      await getTeamProjects(team.id);
    } catch (err) {
      console.error('Ошибка загрузки проектов команды:', err);
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (!selectedTeam) return;
    
    try {
      await createTeamTask(selectedTeam.id, taskData);
      setShowTaskModal(false);
      setSelectedTeam(null);
    } catch (err) {
      console.error('Ошибка создания командной задачи:', err);
    }
  };

  const handleViewTasks = (team: Team) => {
    setSelectedTeam(team);
    setShowTasksView(true);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${className}`}>
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Команды</h2>
            <p className="text-gray-300 text-sm">Управляйте командами и коллаборацией</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => syncWithAPI()}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Синхронизировать</span>
          </motion.button>
          <motion.button
            onClick={handleCreateTeam}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Создать команду</span>
          </motion.button>
        </div>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Состояние ошибки */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm mb-6"
        >
          <div className="flex items-center space-x-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Сетка команд */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 group"
            >
              {/* Цветовая полоса */}
              <motion.div 
                className="h-3 w-full rounded-full mb-8 shadow-lg"
                style={{ 
                  background: `linear-gradient(90deg, ${team.color}, ${team.color}80)`,
                  boxShadow: `0 0 25px ${team.color}50`
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
              />
              
              {/* Информация о команде */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xl mb-2">{team.name}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{team.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {team.isOwner && (
                      <motion.div 
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        <Crown className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-medium">Owner</span>
                      </motion.div>
                    )}
                    {team.isOwner && (
                      <motion.button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {/* Статистика */}
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-700/40 rounded-lg border border-slate-600/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-200 text-sm font-medium">{team.memberCount || 0} участников</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-700/40 rounded-lg border border-slate-600/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-slate-200 text-sm font-medium">{team.projectCount || 0} проектов</span>
                  </motion.div>
                </div>
                
                {/* Действия */}
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {/* Основные действия */}
                    <motion.button 
                      onClick={() => handleCreateTask(team)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 border border-green-500/30 hover:border-green-500/50 shadow-lg hover:shadow-green-500/20 group text-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckSquare className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="font-medium truncate">Создать задачу</span>
                    </motion.button>

                    <motion.button 
                      onClick={() => handleViewTasks(team)}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 rounded-lg hover:from-purple-500/30 hover:to-violet-500/30 transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/20 group text-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="font-medium truncate">Просмотр задач</span>
                    </motion.button>
                  </div>
                  
                  {/* Дополнительные действия */}
                  <div className="flex items-center justify-center space-x-2 flex-wrap">
                    {team.isOwner ? (
                      <>
                        <motion.button 
                          onClick={() => handleInviteUser(team)}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-medium">Пригласить</span>
                        </motion.button>
                        <motion.button 
                          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-600/20 text-slate-400 rounded-lg hover:bg-slate-600/30 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-medium">Настройки</span>
                        </motion.button>
                      </>
                    ) : (
                      <motion.button 
                        onClick={() => handleJoinTeam(team.id)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium">Присоединиться</span>
                      </motion.button>
                    )}
                    
                    <motion.button 
                      className="flex items-center space-x-1.5 px-3 py-2 bg-slate-600/20 text-slate-400 rounded-lg hover:bg-slate-600/30 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium">Чат</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {teams.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div 
            className="w-32 h-32 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-slate-700/30"
            animate={{ 
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Users className="w-16 h-16 text-slate-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-4">Нет команд</h3>
          <p className="text-slate-400 mb-8 text-lg max-w-md mx-auto">
            Создайте свою первую команду или присоединитесь к существующей для совместной работы
          </p>
          <motion.button
            onClick={handleCreateTeam}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Создать команду
          </motion.button>
        </motion.div>
      )}

      {/* Модальные окна */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={async (teamData) => {
            try {
              await createTeam(teamData);
              setShowCreateModal(false);
            } catch (err) {
              console.error('Ошибка создания команды:', err);
            }
          }}
        />
      )}

      {showInviteModal && selectedTeam && (
        <InviteUserModal
          team={selectedTeam}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedTeam(null);
          }}
          onSuccess={() => {
            setShowInviteModal(false);
            setSelectedTeam(null);
          }}
        />
      )}

      {showTaskModal && selectedTeam && (
        <TeamTaskForm
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          teamProjects={Array.isArray(teamProjects) ? teamProjects.filter(p => p.team_id === selectedTeam.id) : []}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTeam(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {showTasksView && selectedTeam && (
        <TeamTasksView
          team={selectedTeam}
          onClose={() => {
            setShowTasksView(false);
            setSelectedTeam(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamsSection;

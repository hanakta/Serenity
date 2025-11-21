import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Users, Mail, Calendar, UserPlus } from 'lucide-react';
import { useInvitations } from '../hooks/useInvitations';

interface InvitationsListProps {
  className?: string;
}

export const InvitationsList: React.FC<InvitationsListProps> = ({ className = '' }) => {
  const {
    invitations,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    formatTimeAgo,
    isExpired
  } = useInvitations();

  const handleAccept = async (token: string) => {
    try {
      await acceptInvitation(token);
    } catch (error) {
      console.error('Ошибка принятия приглашения:', error);
    }
  };

  const handleDecline = async (token: string) => {
    try {
      await declineInvitation(token);
    } catch (error) {
      console.error('Ошибка отклонения приглашения:', error);
    }
  };

  const getStatusColor = (status: string, expiresAt: string) => {
    if (isExpired(expiresAt)) return 'text-red-400';
    if (status === 'pending') return 'text-yellow-400';
    if (status === 'accepted') return 'text-green-400';
    if (status === 'declined') return 'text-red-400';
    return 'text-gray-400';
  };

  const getStatusText = (status: string, expiresAt: string) => {
    if (isExpired(expiresAt)) return 'Истекло';
    if (status === 'pending') return 'Ожидает';
    if (status === 'accepted') return 'Принято';
    if (status === 'declined') return 'Отклонено';
    return status;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <motion.div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-white/70">Загрузка приглашений...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-red-400 mb-2">Ошибка загрузки приглашений</div>
        <div className="text-white/60 text-sm">{error}</div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserPlus className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <h4 className="text-base font-medium text-white mb-2">Нет входящих приглашений</h4>
          <p className="text-white/60 text-sm">
            У вас пока нет приглашений в команды
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-white/60 text-sm">
          {invitations.length} приглашений
        </div>
      </div>

      {invitations.map((invitation, index) => (
        <motion.div
          key={invitation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Заголовок команды */}
              <div className="flex items-center mb-3">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: invitation.team_color || '#3B82F6' }}
                />
                <h3 className="text-lg font-semibold text-white">
                  {invitation.team_name || 'Неизвестная команда'}
                </h3>
              </div>

              {/* Описание команды */}
              {invitation.team_description && (
                <p className="text-white/70 text-sm mb-4">
                  {invitation.team_description}
                </p>
              )}

              {/* Детали приглашения */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-white/60 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Приглашен: {invitation.email}</span>
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Роль: {invitation.role === 'admin' ? 'Администратор' : 'Участник'}</span>
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span>Пригласил: {invitation.invited_by_name || 'Неизвестный'}</span>
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatTimeAgo(invitation.created_at)}</span>
                </div>
              </div>

              {/* Статус */}
              <div className="flex items-center mb-4">
                <Clock className="w-4 h-4 mr-2" />
                <span className={`text-sm font-medium ${getStatusColor(invitation.status, invitation.expires_at)}`}>
                  {getStatusText(invitation.status, invitation.expires_at)}
                </span>
                {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                  <span className="ml-2 text-white/50 text-xs">
                    (истекает {formatTimeAgo(invitation.expires_at)})
                  </span>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
              <div className="flex space-x-2 ml-4">
                <motion.button
                  onClick={() => handleAccept(invitation.token)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="w-4 h-4" />
                  <span>Принять</span>
                </motion.button>
                <motion.button
                  onClick={() => handleDecline(invitation.token)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                  <span>Отклонить</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

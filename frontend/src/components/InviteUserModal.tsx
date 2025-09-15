'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Shield, Eye, Crown } from 'lucide-react';
import { Team } from '@/hooks/useTeams';

interface InviteUserModalProps {
  team: Team;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ team, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email.trim()) {
      setLoading(true);
      try {
        // Здесь будет вызов API для приглашения пользователя
        // await inviteUser(team.id, formData.email, formData.role);
        onSuccess();
      } catch (err) {
        console.error('Ошибка отправки приглашения:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <UserPlus className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Может управлять командой и участниками';
      case 'viewer':
        return 'Может только просматривать содержимое';
      default:
        return 'Может создавать задачи и участвовать в обсуждениях';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md mx-4 border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="p-2 bg-green-500/20 rounded-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <UserPlus className="w-5 h-5 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white">Пригласить в команду</h3>
            </div>
            <motion.button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Team Info */}
          <motion.div 
            className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: team.color }}
              />
              <div>
                <p className="text-sm text-gray-300">Команда:</p>
                <p className="text-white font-medium">{team.name}</p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email пользователя *
              </label>
              <motion.input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500/50 transition-all duration-300"
                placeholder="user@example.com"
                required
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Роль в команде
              </label>
              <div className="space-y-2">
                {[
                  { value: 'member', label: 'Участник', icon: UserPlus, color: 'text-blue-400' },
                  { value: 'admin', label: 'Администратор', icon: Shield, color: 'text-purple-400' },
                  { value: 'viewer', label: 'Наблюдатель', icon: Eye, color: 'text-gray-400' }
                ].map(({ value, label, icon: Icon, color }, index) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: value as 'admin' | 'member' | 'viewer' })}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                      formData.role === value
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{label}</p>
                      <p className="text-xs opacity-70">{getRoleDescription(value)}</p>
                    </div>
                    {formData.role === value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Кнопки */}
            <motion.div 
              className="flex space-x-3 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Отмена
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || !formData.email.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Отправка...</span>
                  </div>
                ) : (
                  'Пригласить'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteUserModal;

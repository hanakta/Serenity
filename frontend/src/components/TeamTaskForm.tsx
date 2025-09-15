'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Flag, FileText, Clock, AlertCircle, CheckCircle, Folder } from 'lucide-react';
import { TeamProject } from '@/hooks/useTeamTasks';

interface TeamTaskFormProps {
  teamId: string;
  teamName: string;
  teamProjects: TeamProject[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  project_id?: string;
  due_date?: string;
}

const TeamTaskForm: React.FC<TeamTaskFormProps> = ({
  teamId,
  teamName,
  teamProjects,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    project_id: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      setLoading(true);
      try {
        await onSave(formData);
        // Сбрасываем форму
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          project_id: '',
          due_date: ''
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <Flag className="w-4 h-4 text-orange-400" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  if (!isOpen) return null;

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
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl mx-4 border border-white/20 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="p-2 bg-blue-500/20 rounded-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <FileText className="w-5 h-5 text-blue-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-white">Создать задачу</h3>
                <p className="text-sm text-gray-400">Команда: {teamName}</p>
              </div>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Название задачи */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Название задачи *
              </label>
              <motion.input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Введите название задачи"
                required
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Описание */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание
              </label>
              <motion.textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 resize-none transition-all duration-300"
                placeholder="Описание задачи (необязательно)"
                rows={4}
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Приоритет и Проект */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Приоритет */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Приоритет
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Низкий', icon: CheckCircle },
                    { value: 'medium', label: 'Средний', icon: Clock },
                    { value: 'high', label: 'Высокий', icon: Flag },
                    { value: 'urgent', label: 'Срочный', icon: AlertCircle }
                  ].map(({ value, label, icon: Icon }, index) => (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: value as any })}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                        formData.priority === value
                          ? `${getPriorityColor(value)}`
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Проект */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Проект
                </label>
                <motion.select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="" className="bg-slate-800">Без проекта</option>
                  {teamProjects.map((project) => (
                    <option key={project.id} value={project.id} className="bg-slate-800">
                      {project.name}
                    </option>
                  ))}
                </motion.select>
              </motion.div>
            </div>

            {/* Дата выполнения */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата выполнения
              </label>
              <motion.input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Кнопки */}
            <motion.div 
              className="flex space-x-3 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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
                disabled={loading || !formData.title.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span>Создание...</span>
                  </div>
                ) : (
                  'Создать задачу'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamTaskForm;

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Calendar, Flag, FileText, User } from 'lucide-react';

interface TeamTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onCreateTask: (taskData: any) => Promise<void>;
  projects?: any[];
}

export default function TeamTaskModal({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName, 
  onCreateTask,
  projects = []
}: TeamTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    project_id: '',
    assignee_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Название задачи обязательно');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreateTask({
        ...formData,
        team_id: teamId
      });
      
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        project_id: '',
        assignee_id: ''
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания задачи');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckSquare className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">Создать задачу</h2>
                  <p className="text-white/70 text-sm">Команда: {teamName}</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Название задачи *
              </label>
              <motion.input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Введите название задачи"
                whileFocus={{ scale: 1.02 }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Описание
              </label>
              <motion.textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300 resize-none"
                placeholder="Опишите детали задачи"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  <Flag className="w-4 h-4 inline mr-2" />
                  Приоритет
                </label>
                <motion.select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="low" className="bg-slate-800">Низкий</option>
                  <option value="medium" className="bg-slate-800">Средний</option>
                  <option value="high" className="bg-slate-800">Высокий</option>
                  <option value="urgent" className="bg-slate-800">Срочный</option>
                </motion.select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  <CheckSquare className="w-4 h-4 inline mr-2" />
                  Статус
                </label>
                <motion.select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="pending" className="bg-slate-800">Ожидает</option>
                  <option value="in_progress" className="bg-slate-800">В работе</option>
                  <option value="completed" className="bg-slate-800">Завершено</option>
                  <option value="cancelled" className="bg-slate-800">Отменено</option>
                </motion.select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Срок выполнения
              </label>
              <motion.input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                whileFocus={{ scale: 1.02 }}
              />
            </div>

            {/* Project */}
            {projects.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Проект
                </label>
                <motion.select
                  value={formData.project_id}
                  onChange={(e) => handleChange('project_id', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="" className="bg-slate-800">Без проекта</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id} className="bg-slate-800">
                      {project.name}
                    </option>
                  ))}
                </motion.select>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Отмена
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Создание...</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Создать задачу</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

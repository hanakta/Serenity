'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Upload, Trash2, Database, FileText, Archive, AlertTriangle, CheckCircle, Clock, HardDrive } from 'lucide-react'

interface DataSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string) => Promise<void>
  onImport: (file: File) => Promise<void>
  onDelete: (type: string) => Promise<void>
}

export default function DataSettingsModal({ isOpen, onClose, onExport, onImport, onDelete }: DataSettingsModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [deleteType, setDeleteType] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const exportFormats = [
    { key: 'json', label: 'JSON', desc: 'Стандартный формат для разработчиков', icon: FileText },
    { key: 'csv', label: 'CSV', desc: 'Табличный формат для Excel', icon: Database },
    { key: 'pdf', label: 'PDF', desc: 'Документ для печати', icon: FileText },
    { key: 'xlsx', label: 'Excel', desc: 'Таблица Excel', icon: Database }
  ]

  const dataTypes = [
    { key: 'tasks', label: 'Задачи', count: 24, size: '2.3 MB', desc: 'Все ваши задачи и проекты' },
    { key: 'settings', label: 'Настройки', count: 1, size: '0.1 MB', desc: 'Персональные настройки' },
    { key: 'notifications', label: 'Уведомления', count: 156, size: '0.8 MB', desc: 'История уведомлений' },
    { key: 'analytics', label: 'Аналитика', count: 1, size: '1.2 MB', desc: 'Статистика и отчеты' }
  ]

  const handleExport = async (format: string) => {
    setLoading(true)
    try {
      await onExport(format)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Ошибка экспорта:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      await onImport(file)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Ошибка импорта:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (type: string) => {
    setLoading(true)
    try {
      await onDelete(type)
      setSuccess(true)
      setShowDeleteConfirm(false)
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Ошибка удаления:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-glow overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-slate-700/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))",
                  "linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
                  "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))",
                  "linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))"
                ]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Database className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Управление данными</h2>
                  <p className="text-slate-400">Экспорт, импорт и управление вашими данными</p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-6 mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold">Операция выполнена!</h3>
                  <p className="text-green-300 text-sm">Ваши данные успешно обработаны</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Data Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <HardDrive className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Обзор данных</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dataTypes.map((type) => (
                    <motion.div
                      key={type.key}
                      className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{type.label}</h4>
                        <span className="text-cyan-400 text-sm font-mono">{type.count}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{type.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">{type.size}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Export Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Экспорт данных</h3>
                </div>
                
                <div className="p-6 bg-slate-700/30 rounded-2xl border border-slate-600/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {exportFormats.map((format) => (
                      <motion.div
                        key={format.key}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          selectedFormat === format.key
                            ? 'bg-cyan-500/20 border-cyan-500/50'
                            : 'bg-slate-600/30 border-slate-500/30 hover:border-slate-400/50'
                        }`}
                        onClick={() => setSelectedFormat(format.key)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <format.icon className={`w-5 h-5 ${
                            selectedFormat === format.key ? 'text-cyan-400' : 'text-slate-400'
                          }`} />
                          <h4 className={`font-medium ${
                            selectedFormat === format.key ? 'text-cyan-400' : 'text-white'
                          }`}>
                            {format.label}
                          </h4>
                        </div>
                        <p className="text-slate-400 text-sm">{format.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.button
                    onClick={() => handleExport(selectedFormat)}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Экспортировать в {exportFormats.find(f => f.key === selectedFormat)?.label}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Import Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Импорт данных</h3>
                </div>
                
                <div className="p-6 bg-slate-700/30 rounded-2xl border border-slate-600/30">
                  <div className="text-center mb-6">
                    <Archive className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">Загрузите файл данных</h4>
                    <p className="text-slate-400 text-sm">
                      Поддерживаются форматы: JSON, CSV, Excel
                    </p>
                  </div>
                  
                  <input
                    type="file"
                    accept=".json,.csv,.xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  
                  <motion.label
                    htmlFor="import-file"
                    className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 cursor-pointer text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-5 h-5 mr-2 inline" />
                    Выбрать файл
                  </motion.label>
                </div>
              </motion.div>

              {/* Delete Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-semibold text-white">Удаление данных</h3>
                </div>
                
                <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/30">
                  <div className="flex items-start space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
                    <div>
                      <h4 className="text-red-400 font-semibold mb-2">Осторожно!</h4>
                      <p className="text-slate-300 text-sm">
                        Удаление данных необратимо. Убедитесь, что вы экспортировали важную информацию.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dataTypes.map((type) => (
                      <motion.button
                        key={type.key}
                        onClick={() => {
                          setDeleteType(type.key)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-4 bg-slate-700/30 hover:bg-red-500/20 rounded-2xl border border-slate-600/30 hover:border-red-500/50 transition-all duration-300 text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{type.label}</h4>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-slate-400 text-sm">{type.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons - зафиксированы внизу */}
          <div className="border-t border-slate-700/50 p-6 bg-slate-800/50">
            <div className="flex items-center justify-end space-x-4">
              <motion.button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Закрыть
              </motion.button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-800 rounded-2xl border border-red-500/50 p-6 max-w-md w-full"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Подтверждение удаления</h3>
                      <p className="text-slate-400">Это действие необратимо</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-6">
                    Вы уверены, что хотите удалить все данные типа &quot;{dataTypes.find(t => t.key === deleteType)?.label}&quot;? 
                    Это действие нельзя отменить.
                  </p>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <motion.button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Отмена
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDelete(deleteType)}
                      disabled={loading}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Удаление...' : 'Удалить'}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
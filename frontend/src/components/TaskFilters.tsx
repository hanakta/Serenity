'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskFilters as TaskFiltersType, PRIORITY_OPTIONS, CATEGORY_OPTIONS, STATUS_OPTIONS } from '@/lib/utils'
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, SortAsc, SortDesc } from 'lucide-react'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFiltersChange: (filters: TaskFiltersType) => void
  onClearFilters: () => void
}

export default function TaskFilters({ filters, onFiltersChange, onClearFilters }: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleMultiSelectChange = (key: keyof TaskFiltersType, value: string) => {
    const currentValues = filters[key] as string[] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : value !== '')
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
      case 'medium': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400'
      case 'low': return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400'
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400'
      case 'in_progress': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400'
      case 'pending': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400'
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400'
      case 'personal': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
      case 'health': return 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400'
      case 'learning': return 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400'
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl backdrop-blur-xl border border-slate-700/50 shadow-glow overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Фильтры и поиск</h3>
              <p className="text-slate-400 text-sm">Настройте параметры отображения задач</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClearFilters}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Очистить</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isExpanded ? 'Свернуть' : 'Развернуть'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            placeholder="Поиск по названию или описанию..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-8">
              {/* Status Filters */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Статус задач</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = filters.status?.includes(option.value) || false
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMultiSelectChange('status', option.value)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 border ${
                          isSelected
                            ? getStatusColor(option.value)
                            : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Priority Filters */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Приоритет</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {PRIORITY_OPTIONS.map((option) => {
                    const isSelected = filters.priority?.includes(option.value) || false
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMultiSelectChange('priority', option.value)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 border ${
                          isSelected
                            ? getPriorityColor(option.value)
                            : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Category Filters */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Категория</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {CATEGORY_OPTIONS.map((option) => {
                    const isSelected = filters.category?.includes(option.value) || false
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMultiSelectChange('category', option.value)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 border ${
                          isSelected
                            ? getCategoryColor(option.value)
                            : 'bg-slate-700/50 text-slate-300 border-slate-600/50 hover:bg-slate-600/50'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Sorting and Date Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sorting */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <SortAsc className="w-5 h-5 text-purple-400" />
                    <span>Сортировка</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Сортировать по</label>
                      <select
                        value={filters.sort_by || 'created_at'}
                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      >
                        <option value="created_at">Дате создания</option>
                        <option value="updated_at">Дате обновления</option>
                        <option value="due_date">Сроку выполнения</option>
                        <option value="priority">Приоритету</option>
                        <option value="title">Названию</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Порядок</label>
                      <select
                        value={filters.sort_order || 'desc'}
                        onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      >
                        <option value="desc">По убыванию</option>
                        <option value="asc">По возрастанию</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Период выполнения</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">С даты</label>
                      <input
                        type="date"
                        value={filters.due_date_from || ''}
                        onChange={(e) => handleFilterChange('due_date_from', e.target.value || undefined)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">По дату</label>
                      <input
                        type="date"
                        value={filters.due_date_to || ''}
                        onChange={(e) => handleFilterChange('due_date_to', e.target.value || undefined)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
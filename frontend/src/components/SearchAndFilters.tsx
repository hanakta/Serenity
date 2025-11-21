'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  User, 
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react'

interface SearchAndFiltersProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: TaskFilters) => void
  onSortChange: (sort: SortOption) => void
  onViewChange: (view: 'grid' | 'list') => void
  currentView?: 'grid' | 'list'
  placeholder?: string
}

interface TaskFilters {
  status?: string[]
  priority?: string[]
  category?: string[]
  assignedTo?: string[]
  dueDate?: string
  tags?: string[]
}

interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

const statusOptions = [
  { value: 'pending', label: 'Ожидает', icon: Circle, color: 'text-yellow-400' },
  { value: 'in_progress', label: 'В работе', icon: Clock, color: 'text-blue-400' },
  { value: 'completed', label: 'Завершена', icon: CheckCircle, color: 'text-green-400' },
  { value: 'cancelled', label: 'Отменена', icon: X, color: 'text-red-400' }
]

const priorityOptions = [
  { value: 'low', label: 'Низкий', color: 'bg-green-500' },
  { value: 'medium', label: 'Средний', color: 'bg-yellow-500' },
  { value: 'high', label: 'Высокий', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Срочный', color: 'bg-red-500' }
]

const categoryOptions = [
  { value: 'personal', label: 'Личные' },
  { value: 'work', label: 'Работа' },
  { value: 'health', label: 'Здоровье' },
  { value: 'learning', label: 'Обучение' },
  { value: 'shopping', label: 'Покупки' },
  { value: 'other', label: 'Другое' }
]

const sortOptions = [
  { field: 'created_at', label: 'Дата создания' },
  { field: 'due_date', label: 'Срок выполнения' },
  { field: 'priority', label: 'Приоритет' },
  { field: 'title', label: 'Название' },
  { field: 'status', label: 'Статус' }
]

export default function SearchAndFilters({
  onSearch,
  onFilterChange,
  onSortChange,
  onViewChange,
  currentView = 'list',
  placeholder = 'Поиск задач...'
}: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'created_at', direction: 'desc' })
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  const searchRef = useRef<HTMLInputElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)
  const filterMenuRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFilterChange = (filterType: keyof TaskFilters, value: string | string[]) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (field: string) => {
    const newDirection: 'asc' | 'desc' = sortBy.field === field && sortBy.direction === 'asc' ? 'desc' : 'asc'
    const newSort = { field, direction: newDirection }
    setSortBy(newSort)
    onSortChange(newSort)
    setShowSortMenu(false)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const getActiveFiltersCount = () => {
    let count = 0
    Object.values(filters).forEach(value => {
      if (Array.isArray(value)) {
        count += value.length
      } else if (value) {
        count += 1
      }
    })
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Search and Main Controls */}
      <div className="flex items-center space-x-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <motion.button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className={`relative px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
            activeFiltersCount > 0
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-4 h-4" />
          <span>Фильтры</span>
          {activeFiltersCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {activeFiltersCount}
            </motion.span>
          )}
        </motion.button>

        {/* Sort Button */}
        <div className="relative" ref={sortMenuRef}>
          <motion.button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {sortBy.direction === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
            <span>Сортировка</span>
          </motion.button>

          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-large z-50"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.field}
                    onClick={() => handleSortChange(option.field)}
                    className={`w-full flex items-center justify-between p-3 text-left hover:bg-slate-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      sortBy.field === option.field ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy.field === option.field && (
                      <div className="flex items-center space-x-1">
                        {sortBy.direction === 'asc' ? (
                          <SortAsc className="w-4 h-4" />
                        ) : (
                          <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-700/50 rounded-xl p-1">
          <motion.button
            onClick={() => onViewChange('list')}
            className={`p-2 rounded-lg transition-colors ${
              currentView === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <List className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => onViewChange('grid')}
            className={`p-2 rounded-lg transition-colors ${
              currentView === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Grid className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Filter Menu */}
      <AnimatePresence>
        {showFilterMenu && (
          <motion.div
            ref={filterMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 space-y-4"
          >
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Статус</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => {
                  const Icon = status.icon
                  const isSelected = filters.status?.includes(status.value)
                  return (
                    <motion.button
                      key={status.value}
                      onClick={() => {
                        const currentStatus = filters.status || []
                        const newStatus = isSelected
                          ? currentStatus.filter(s => s !== status.value)
                          : [...currentStatus, status.value]
                        handleFilterChange('status', newStatus.length > 0 ? newStatus : undefined)
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`w-4 h-4 ${status.color}`} />
                      <span className="text-sm">{status.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Приоритет</h3>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((priority) => {
                  const isSelected = filters.priority?.includes(priority.value)
                  return (
                    <motion.button
                      key={priority.value}
                      onClick={() => {
                        const currentPriority = filters.priority || []
                        const newPriority = isSelected
                          ? currentPriority.filter(p => p !== priority.value)
                          : [...currentPriority, priority.value]
                        handleFilterChange('priority', newPriority.length > 0 ? newPriority : undefined)
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                      <span className="text-sm">{priority.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Категория</h3>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const isSelected = filters.category?.includes(category.value)
                  return (
                    <motion.button
                      key={category.value}
                      onClick={() => {
                        const currentCategory = filters.category || []
                        const newCategory = isSelected
                          ? currentCategory.filter(c => c !== category.value)
                          : [...currentCategory, category.value]
                        handleFilterChange('category', newCategory.length > 0 ? newCategory : undefined)
                      }}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end">
                <motion.button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" />
                  <span>Очистить фильтры</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {Object.entries(filters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null
            
            return (
              <div key={key} className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                <span>{key}:</span>
                <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                <button
                  onClick={() => handleFilterChange(key as keyof TaskFilters, undefined)}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}















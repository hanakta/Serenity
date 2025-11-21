'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Palette } from 'lucide-react'

interface ColorTheme {
  id: string
  name: string
  primary: string
  secondary: string
  gradient: string
  preview: string
}

const colorThemes: ColorTheme[] = [
  {
    id: 'blue-purple',
    name: 'Синий-Фиолетовый',
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    gradient: 'from-blue-500 to-purple-600',
    preview: 'bg-gradient-to-r from-blue-500 to-purple-600'
  },
  {
    id: 'green-emerald',
    name: 'Зеленый-Изумрудный',
    primary: '#10B981',
    secondary: '#059669',
    gradient: 'from-green-500 to-emerald-600',
    preview: 'bg-gradient-to-r from-green-500 to-emerald-600'
  },
  {
    id: 'red-pink',
    name: 'Красный-Розовый',
    primary: '#EF4444',
    secondary: '#EC4899',
    gradient: 'from-red-500 to-pink-600',
    preview: 'bg-gradient-to-r from-red-500 to-pink-600'
  },
  {
    id: 'orange-yellow',
    name: 'Оранжевый-Желтый',
    primary: '#F59E0B',
    secondary: '#EAB308',
    gradient: 'from-orange-500 to-yellow-500',
    preview: 'bg-gradient-to-r from-orange-500 to-yellow-500'
  },
  {
    id: 'purple-indigo',
    name: 'Фиолетовый-Индиго',
    primary: '#8B5CF6',
    secondary: '#6366F1',
    gradient: 'from-purple-500 to-indigo-600',
    preview: 'bg-gradient-to-r from-purple-500 to-indigo-600'
  },
  {
    id: 'cyan-teal',
    name: 'Бирюзовый-Зеленый',
    primary: '#06B6D4',
    secondary: '#14B8A6',
    gradient: 'from-cyan-500 to-teal-600',
    preview: 'bg-gradient-to-r from-cyan-500 to-teal-600'
  },
  {
    id: 'rose-pink',
    name: 'Розовый-Пурпурный',
    primary: '#F43F5E',
    secondary: '#A855F7',
    gradient: 'from-rose-500 to-purple-600',
    preview: 'bg-gradient-to-r from-rose-500 to-purple-600'
  },
  {
    id: 'slate-gray',
    name: 'Серый-Сланцевый',
    primary: '#64748B',
    secondary: '#475569',
    gradient: 'from-slate-500 to-slate-600',
    preview: 'bg-gradient-to-r from-slate-500 to-slate-600'
  }
]

interface ColorThemeSelectorProps {
  currentTheme?: string
  onThemeChange?: (themeId: string) => void
}

export default function ColorThemeSelector({ 
  currentTheme = 'blue-purple', 
  onThemeChange 
}: ColorThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  useEffect(() => {
    // Загружаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('serenity-color-theme')
    if (savedTheme) {
      setSelectedTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId)
    
    // Сохраняем в localStorage
    localStorage.setItem('serenity-color-theme', themeId)
    
    // Применяем CSS переменные
    const theme = colorThemes.find(t => t.id === themeId)
    if (theme) {
      document.documentElement.style.setProperty('--color-primary', theme.primary)
      document.documentElement.style.setProperty('--color-secondary', theme.secondary)
    }
    
    onThemeChange?.(themeId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Цветовая палитра</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {colorThemes.map((theme) => (
          <motion.button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedTheme === theme.id
                ? 'border-white/50 shadow-glow'
                : 'border-slate-600/50 hover:border-slate-500/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Градиентный фон */}
            <div className={`w-full h-16 rounded-lg mb-2 ${theme.preview}`} />
            
            {/* Название темы */}
            <div className="text-xs text-slate-300 text-center">
              {theme.name}
            </div>
            
            {/* Индикатор выбора */}
            {selectedTheme === theme.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <Check className="w-4 h-4 text-slate-800" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      <div className="text-xs text-slate-400 text-center">
        Выберите цветовую палитру для интерфейса. Изменения применяются мгновенно.
      </div>
    </div>
  )
}















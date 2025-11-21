'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Sun, Moon, Monitor, Smartphone, Laptop, Check, Sparkles, Eye, Settings2 } from 'lucide-react'
import ColorThemeSelector from './settings/ColorThemeSelector'

interface ThemeSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (theme: ThemeSettings) => Promise<void>
}

interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
  animations: boolean
  particles: boolean
  glassmorphism: boolean
  customCSS: string
}

export default function ThemeSettingsModal({ isOpen, onClose, onSave }: ThemeSettingsModalProps) {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: 'dark',
    primaryColor: 'blue',
    accentColor: 'purple',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    particles: true,
    glassmorphism: true,
    customCSS: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Загружаем сохраненную тему при открытии
  useEffect(() => {
    if (isOpen) {
      const savedTheme = localStorage.getItem('theme-settings')
      if (savedTheme) {
        try {
          setTheme(JSON.parse(savedTheme))
        } catch (error) {
          console.error('Ошибка загрузки темы:', error)
        }
      }
    }
  }, [isOpen])

  const colorOptions = [
    { name: 'blue', label: 'Синий', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'purple', label: 'Фиолетовый', gradient: 'from-purple-500 to-pink-500' },
    { name: 'green', label: 'Зеленый', gradient: 'from-green-500 to-emerald-500' },
    { name: 'orange', label: 'Оранжевый', gradient: 'from-orange-500 to-yellow-500' },
    { name: 'red', label: 'Красный', gradient: 'from-red-500 to-rose-500' },
    { name: 'indigo', label: 'Индиго', gradient: 'from-indigo-500 to-blue-500' },
    { name: 'teal', label: 'Бирюзовый', gradient: 'from-teal-500 to-cyan-500' },
    { name: 'pink', label: 'Розовый', gradient: 'from-pink-500 to-rose-500' }
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Сохраняем в localStorage
      localStorage.setItem('theme-settings', JSON.stringify(theme))
      
      // Применяем тему к документу
      applyTheme(theme)
      
      // Вызываем callback
      await onSave(theme)
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Ошибка сохранения темы:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement
    
    // Применяем режим темы
    root.setAttribute('data-theme', themeSettings.mode)
    
    // Применяем цветовую схему
    root.setAttribute('data-primary-color', themeSettings.primaryColor)
    
    // Применяем размер шрифта
    root.setAttribute('data-font-size', themeSettings.fontSize)
    
    // Применяем дополнительные настройки
    root.setAttribute('data-compact-mode', themeSettings.compactMode.toString())
    root.setAttribute('data-animations', themeSettings.animations.toString())
    root.setAttribute('data-particles', themeSettings.particles.toString())
    root.setAttribute('data-glassmorphism', themeSettings.glassmorphism.toString())
    
    // Применяем пользовательский CSS
    let customStyle = document.getElementById('custom-theme-css')
    if (!customStyle) {
      customStyle = document.createElement('style')
      customStyle.id = 'custom-theme-css'
      document.head.appendChild(customStyle)
    }
    customStyle.textContent = themeSettings.customCSS
  }

  const handleReset = () => {
    const defaultTheme = {
      mode: 'dark' as const,
      primaryColor: 'blue',
      accentColor: 'purple',
      fontSize: 'medium' as const,
      compactMode: false,
      animations: true,
      particles: true,
      glassmorphism: true,
      customCSS: ''
    }
    setTheme(defaultTheme)
    
    // Удаляем сохраненную тему
    localStorage.removeItem('theme-settings')
    
    // Применяем дефолтную тему
    applyTheme(defaultTheme)
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
    if (!previewMode) {
      // Применяем превью темы
      applyTheme(theme)
    } else {
      // Возвращаем сохраненную тему
      const savedTheme = localStorage.getItem('theme-settings')
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme)
          applyTheme(parsedTheme)
        } catch (error) {
          console.error('Ошибка загрузки сохраненной темы:', error)
        }
      }
    }
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <motion.button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-orange-600' : 'bg-slate-600'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )

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

        {/* Modal - исправлены размеры для мобильных устройств */}
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
              className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-amber-500/10"
              animate={{
                background: [
                  "linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.1))",
                  "linear-gradient(45deg, rgba(245, 158, 11, 0.1), rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1))",
                  "linear-gradient(45deg, rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.1), rgba(249, 115, 22, 0.1))",
                  "linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1), rgba(245, 158, 11, 0.1))"
                ]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-3 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Palette className="w-8 h-8 text-orange-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Настройки темы</h2>
                  <p className="text-slate-400">Персонализируйте внешний вид приложения</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={handlePreview}
                  className={`px-4 py-2 rounded-xl transition-colors flex items-center space-x-2 ${
                    previewMode 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4" />
                  <span>{previewMode ? 'Скрыть' : 'Превью'}</span>
                </motion.button>
                
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
                <Check className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold">Тема сохранена!</h3>
                  <p className="text-green-300 text-sm">Ваши настройки темы применены</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form - добавлен скролл */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Theme Mode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Monitor className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Режим темы</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'light', label: 'Светлая', icon: Sun, desc: 'Яркая тема для дневного использования' },
                    { key: 'dark', label: 'Темная', icon: Moon, desc: 'Темная тема для комфортного просмотра' },
                    { key: 'auto', label: 'Авто', icon: Monitor, desc: 'Автоматическое переключение по времени' }
                  ].map((mode) => (
                    <motion.div
                      key={mode.key}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        theme.mode === mode.key
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50'
                      }`}
                      onClick={() => setTheme(prev => ({ ...prev, mode: mode.key as any }))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <mode.icon className={`w-5 h-5 ${
                          theme.mode === mode.key ? 'text-orange-400' : 'text-slate-400'
                        }`} />
                        <h4 className={`font-semibold ${
                          theme.mode === mode.key ? 'text-orange-400' : 'text-white'
                        }`}>
                          {mode.label}
                        </h4>
                        {theme.mode === mode.key && (
                          <Check className="w-4 h-4 text-orange-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{mode.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Color Theme Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <ColorThemeSelector 
                  currentTheme={theme.primaryColor}
                  onThemeChange={(themeId) => setTheme(prev => ({ ...prev, primaryColor: themeId }))}
                />
              </motion.div>

              {/* Font Size */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Laptop className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Размер шрифта</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'small', label: 'Малый', desc: 'Компактный интерфейс' },
                    { key: 'medium', label: 'Средний', desc: 'Стандартный размер' },
                    { key: 'large', label: 'Большой', desc: 'Увеличенный для удобства' }
                  ].map((size) => (
                    <motion.div
                      key={size.key}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        theme.fontSize === size.key
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50'
                      }`}
                      onClick={() => setTheme(prev => ({ ...prev, fontSize: size.key as any }))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${
                          theme.fontSize === size.key ? 'text-orange-400' : 'text-white'
                        }`}>
                          {size.label}
                        </h4>
                        {theme.fontSize === size.key && (
                          <Check className="w-4 h-4 text-orange-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{size.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Advanced Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Settings2 className="w-6 h-6 text-pink-400" />
                  <h3 className="text-xl font-semibold text-white">Дополнительные настройки</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: 'compactMode', label: 'Компактный режим', desc: 'Уменьшить отступы и размеры элементов' },
                    { key: 'animations', label: 'Анимации', desc: 'Включить плавные переходы и эффекты' },
                    { key: 'particles', label: 'Частицы', desc: 'Показывать анимированные частицы на фоне' },
                    { key: 'glassmorphism', label: 'Стеклянный эффект', desc: 'Применить эффект размытого стекла' }
                  ].map((setting) => (
                    <motion.div
                      key={setting.key}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{setting.label}</h4>
                        <p className="text-slate-400 text-sm">{setting.desc}</p>
                      </div>
                      <ToggleSwitch
                        enabled={theme[setting.key as keyof ThemeSettings] as boolean}
                        onChange={() => setTheme(prev => ({ 
                          ...prev, 
                          [setting.key]: !prev[setting.key as keyof ThemeSettings] 
                        }))}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Custom CSS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Palette className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-xl font-semibold text-white">Пользовательский CSS</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Добавьте свой CSS код для дополнительной настройки
                  </label>
                  <textarea
                    value={theme.customCSS}
                    onChange={(e) => setTheme(prev => ({ ...prev, customCSS: e.target.value }))}
                    className="w-full h-24 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 font-mono text-sm resize-none"
                    placeholder="/* Добавьте ваш CSS код здесь */"
                  />
                </div>
              </motion.div>
            </form>
          </div>

          {/* Action Buttons - зафиксированы внизу */}
          <div className="border-t border-slate-700/50 p-6 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <motion.button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Сбросить
              </motion.button>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Отмена
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <Palette className="w-5 h-5" />
                      <span>Сохранить тему</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
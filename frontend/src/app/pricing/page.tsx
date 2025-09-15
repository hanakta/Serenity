'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Building, 
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Clock,
  Headphones,
  Globe,
  Lock,
  Award,
  ArrowLeft,
  Home
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()

  const plans = [
    {
      name: 'Базовый',
      price: { monthly: 0, annual: 0 },
      description: 'Идеально для начала работы',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      features: [
        'До 50 задач',
        'Базовая аналитика',
        'Синхронизация устройств',
        'Поддержка по email',
        'Мобильное приложение',
        'Базовые шаблоны'
      ],
      popular: false,
      cta: 'Начать бесплатно',
      ctaColor: 'from-blue-600 to-blue-700'
    },
    {
      name: 'Профессиональный',
      price: { monthly: 990, annual: 9900 },
      description: 'Для профессионалов и команд',
      icon: <Crown className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-500/10 to-pink-600/10',
      borderColor: 'border-purple-500/30',
      features: [
        'Неограниченные задачи',
        'Расширенная аналитика',
        'Командная работа',
        'Приоритетная поддержка',
        'Интеграции с внешними сервисами',
        'Продвинутые шаблоны',
        'Экспорт данных',
        'Кастомные поля'
      ],
      popular: true,
      cta: 'Выбрать план',
      ctaColor: 'from-purple-600 to-pink-600'
    },
    {
      name: 'Корпоративный',
      price: { monthly: 2990, annual: 29900 },
      description: 'Для больших организаций',
      icon: <Building className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-500/10 to-red-600/10',
      borderColor: 'border-orange-500/30',
      features: [
        'Все возможности Профессионального',
        'Управление командой',
        'Кастомные интеграции',
        'Персональный менеджер',
        'SLA 99.9%',
        'Безопасность корпоративного уровня',
        'API доступ',
        'Белый лейбл'
      ],
      popular: false,
      cta: 'Связаться с нами',
      ctaColor: 'from-orange-600 to-red-600'
    }
  ]

  const formatPrice = (price: number) => {
    if (price === 0) return '0₽'
    return `${price.toLocaleString()}₽`
  }

  const getCurrentPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.price.annual : plan.price.monthly
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.price.annual === 0) return 0
    const monthlyTotal = plan.price.monthly * 12
    const annualPrice = plan.price.annual
    return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Навигационная панель */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Кнопка возвращения */}
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Назад</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-white">Serenity</span>
            </div>
          </motion.div>


          {/* Десктопные кнопки */}
          <motion.div
            className="hidden lg:flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-xl"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Главная</span>
            </motion.button>
            
            <button className="btn-ghost px-6 py-2">
              Войти
            </button>
            <button className="btn-primary px-6 py-2">Начать бесплатно</button>
          </motion.div>

          {/* Мобильные кнопки */}
          <div className="lg:hidden flex items-center space-x-2">
            <motion.button
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-xl"
            >
              <Home className="w-4 h-4" />
            </motion.button>
            
            <button className="btn-ghost px-4 py-2 text-sm">
              Войти
            </button>
            <button className="btn-primary px-4 py-2 text-sm">Начать бесплатно</button>
          </div>
        </div>

      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Заголовок */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Выберите подходящий план
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Начните бесплатно и масштабируйтесь по мере роста ваших потребностей
          </p>

          {/* Переключатель тарификации */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Ежемесячно
            </span>
            <motion.button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ${
                isAnnual ? 'bg-purple-600' : 'bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{ x: isAnnual ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span className={`text-lg font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Ежегодно
            </span>
            {isAnnual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30"
              >
                Экономия до 20%
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Тарифные планы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-8 backdrop-blur-sm border-2 ${
                plan.popular ? 'border-purple-500/50 shadow-glow' : plan.borderColor
              } transition-all duration-300`}
            >
              {/* Популярный бейдж */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 inline mr-1" />
                    Популярный
                  </div>
                </div>
              )}

              {/* Иконка и название */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.bgColor} flex items-center justify-center text-white`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              {/* Цена */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-white">
                    {formatPrice(getCurrentPrice(plan))}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{isAnnual ? 'год' : 'месяц'}
                  </span>
                </div>
                {isAnnual && getSavings(plan) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-400 text-sm font-medium mt-2"
                  >
                    Экономия {getSavings(plan)}%
                  </motion.div>
                )}
              </div>

              {/* Кнопка */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${plan.ctaColor} hover:shadow-lg transition-all duration-300 mb-6`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </motion.button>

              {/* Список возможностей */}
              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + featureIndex * 0.05 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            Все планы включают
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-8 h-8" />, title: 'Безопасность', desc: 'Шифрование данных' },
              { icon: <Users className="w-8 h-8" />, title: 'Поддержка', desc: '24/7 помощь' },
              { icon: <Globe className="w-8 h-8" />, title: 'Синхронизация', desc: 'Все устройства' },
              { icon: <Award className="w-8 h-8" />, title: 'Гарантия', desc: '30 дней возврат' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-slate-800/50 rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ секция */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Часто задаваемые вопросы
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: 'Могу ли я изменить план в любое время?',
                answer: 'Да, вы можете изменить или отменить подписку в любое время. Изменения вступят в силу в следующем биллинговом цикле.'
              },
              {
                question: 'Есть ли бесплатная пробная версия?',
                answer: 'Да, базовый план полностью бесплатный. Профессиональный план включает 14-дневную бесплатную пробную версию.'
              },
              {
                question: 'Какие способы оплаты вы принимаете?',
                answer: 'Мы принимаем все основные кредитные карты, PayPal, банковские переводы и корпоративные счета.'
              },
              {
                question: 'Предоставляете ли вы скидки для некоммерческих организаций?',
                answer: 'Да, мы предоставляем специальные скидки для образовательных учреждений и некоммерческих организаций.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-slate-800/50 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

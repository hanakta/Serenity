# 🚀 Serenity Todo Manager - Полное руководство по структуре проекта

## 📁 Общая структура проекта

```
to_do_project/
├── frontend/                 # Next.js фронтенд приложение
├── backend/                  # PHP backend API
├── package.json              # Корневой package.json для workspace
└── README.md                 # Документация проекта
```

---

## 🎨 Frontend (Next.js 15.5.2)

### 📂 Основная структура
```
frontend/
├── src/
│   ├── app/                  # App Router (Next.js 13+)
│   ├── components/           # React компоненты
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Утилиты и конфигурация
│   └── styles/               # CSS стили
├── public/                   # Статические файлы
├── package.json              # Зависимости frontend
└── next.config.js            # Конфигурация Next.js
```

### 🗂️ App Router (src/app/)

#### 📄 Главные страницы
- **`layout.tsx`** - Основной layout с метаданными и провайдерами
- **`page.tsx`** - Главная страница (дашборд с задачами)
- **`login/page.tsx`** - Страница авторизации
- **`register/page.tsx`** - Страница регистрации

#### 🎯 Ключевые функции главной страницы (page.tsx)
```typescript
// Основные состояния
const [currentView, setCurrentView] = useState('dashboard')
const [showTaskModal, setShowTaskModal] = useState(false)
const [editingTask, setEditingTask] = useState<Task | null>(null)
const [filters, setFilters] = useState<TaskFiltersType>({})

// Обработчики задач
const handleCreateTask = async (taskData: Partial<Task>) => { ... }
const handleEditTask = async (taskData: Partial<Task>) => { ... }
const handleDeleteTask = async (task: Task) => { ... }
const handleToggleComplete = async (task: Task) => { ... }
```

#### 🔄 Система навигации
- **`currentView`** - определяет какой контент отображать
- **Возможные значения**: `dashboard`, `tasks`, `analytics`, `calendar`, `notifications`, `settings`

---

## 🧩 Компоненты (src/components/)

### 🎨 UI Компоненты (src/components/ui/)
```
ui/
├── button.tsx                # Кнопки с вариантами стилей
├── card.tsx                  # Карточки для контента
├── dialog.tsx                # Модальные окна
├── switch.tsx                # Переключатели
├── label.tsx                 # Метки для форм
└── input.tsx                 # Поля ввода
```

### 🏠 Основные компоненты
```
components/
├── Sidebar.tsx               # Боковая навигационная панель
├── PremiumTaskCard.tsx       # Карточка задачи (премиум дизайн)
├── PremiumTaskModal.tsx      # Модальное окно создания/редактирования задач
├── PremiumSettingsButton.tsx # Кнопка настроек
├── PremiumUserProfile.tsx    # Профиль пользователя
├── TaskFilters.tsx           # Фильтры для задач
├── TaskStats.tsx             # Статистика задач
├── StatsCard.tsx             # Карточка статистики
├── CalendarView.tsx          # Календарный вид
├── NotificationsView.tsx     # Вид уведомлений
└── AnimatedBackground.tsx    # Анимированный фон
```

### ⚙️ Модальные окна настроек
```
components/
├── ProfileSettingsModal.tsx      # Настройки профиля
├── SecuritySettingsModal.tsx     # Настройки безопасности
├── NotificationSettingsModal.tsx # Настройки уведомлений
├── ThemeSettingsModal.tsx        # Настройки темы
├── DataSettingsModal.tsx         # Управление данными
└── AboutModal.tsx                # О программе
```

---

## 🎣 Custom Hooks (src/hooks/)

### 🔐 Аутентификация
- **`useAuth.tsx`** - Управление авторизацией пользователя
  - `login(email, password)` - вход в систему
  - `register(userData)` - регистрация
  - `logout()` - выход из системы
  - `user` - текущий пользователь
  - `isLoading` - состояние загрузки

### 📋 Управление задачами
- **`useTasks.tsx`** - Работа с задачами
  - `tasks` - список задач
  - `stats` - статистика
  - `fetchTasks(filters)` - получение задач
  - `createTask(taskData)` - создание задачи
  - `updateTask(id, data)` - обновление задачи
  - `deleteTask(id)` - удаление задачи
  - `fetchStats()` - получение статистики

---

## 🛠️ Утилиты (src/lib/)

### 📊 Типы данных
- **`utils.ts`** - Основные типы и интерфейсы
  - `Task` - интерфейс задачи
  - `TaskFilters` - фильтры задач
  - `User` - пользователь
  - `TaskStats` - статистика

### 🎨 Стили
- **`globals.css`** - Глобальные CSS стили
- **`tailwind.config.js`** - Конфигурация Tailwind CSS

---

## 🎯 Блок задач - Детальное описание

### 📍 Расположение
**Файл**: `frontend/src/app/page.tsx`  
**Строки**: 258-337

### 🏗️ Структура блока задач

#### 1. **Фильтры** (строки 262-267)
```typescript
<TaskFilters
  filters={filters}
  onFiltersChange={handleFiltersChange}
  onClearFilters={handleClearFilters}
/>
```

#### 2. **Состояние загрузки** (строки 280-297)
```typescript
{tasksLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div key={i} className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
        </div>
      </motion.div>
    ))}
  </div>
) : ...}
```

#### 3. **Основная сетка задач** (строки 298-310)
```typescript
{tasks.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {tasks.map((task, index) => (
      <PremiumTaskCard
        key={task.id}
        task={task}
        onEdit={handleEditClick}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        index={index}
      />
    ))}
  </div>
) : ...}
```

#### 4. **Пустое состояние** (строки 311-335)
```typescript
{... : (
  <motion.div className="text-center py-20">
    <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
      <Search className="w-16 h-16 text-slate-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">Задач не найдено</h3>
    <p className="text-slate-400 mb-8 text-lg">
      {Object.keys(filters).length > 0
        ? 'Попробуйте изменить фильтры или создать новую задачу'
        : 'Создайте свою первую задачу, чтобы начать работу'
      }
    </p>
    <button
      onClick={() => setShowTaskModal(true)}
      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
    >
      <Plus className="w-5 h-5 mr-2 inline" />
      Создать задачу
    </button>
  </motion.div>
)}
```

### 🎨 Стилизация блока задач
- **Адаптивная сетка**: 1 колонка на мобильных, 2 на планшетах, 3 на десктопах
- **Анимации**: Framer Motion для плавных переходов
- **Темная тема**: Полупрозрачные элементы с backdrop-blur
- **Градиенты**: Синие и фиолетовые градиенты для акцентов

---

## 🔧 Backend (PHP)

### 📂 Структура
```
backend/
├── public/                   # Публичная папка (точка входа)
│   └── index.php            # Главный файл API
├── src/                     # Исходный код
│   ├── Controllers/         # Контроллеры
│   ├── Models/              # Модели данных
│   ├── Middleware/          # Промежуточное ПО
│   └── Database/            # Работа с БД
├── database/                # База данных
│   ├── serenity.db         # SQLite база данных
│   ├── schema.sql          # MySQL схема
│   └── sqlite_schema.sql   # SQLite схема
└── composer.json            # PHP зависимости
```

### 🌐 API Endpoints
```
POST /api/auth/register      # Регистрация
POST /api/auth/login         # Авторизация
GET  /api/auth/me           # Текущий пользователь
POST /api/auth/logout       # Выход
POST /api/auth/refresh      # Обновление токена

GET  /api/tasks             # Список задач
POST /api/tasks             # Создание задачи
PUT  /api/tasks/{id}        # Обновление задачи
DELETE /api/tasks/{id}      # Удаление задачи
GET  /api/tasks/stats/overview # Статистика
GET  /api/tasks/overdue     # Просроченные задачи
GET  /api/tasks/today       # Задачи на сегодня
```

---

## 🎨 Дизайн система

### 🎨 Цветовая палитра
- **Основной фон**: `bg-slate-900` (темно-серый)
- **Карточки**: `bg-slate-800/90` (полупрозрачный серый)
- **Акценты**: Синие и фиолетовые градиенты
- **Текст**: Белый и серые оттенки

### 🎭 Анимации
- **Framer Motion**: Плавные переходы и анимации
- **Hover эффекты**: Масштабирование и изменение цвета
- **Loading состояния**: Skeleton анимации

### 📱 Адаптивность
- **Mobile First**: Начинаем с мобильных устройств
- **Breakpoints**: sm, md, lg, xl
- **Grid система**: Адаптивные сетки для задач

---

## 🚀 Запуск проекта

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Backend
```bash
cd backend
composer install
php -S localhost:8000 -t public
# http://localhost:8000
```

### Полный запуск
```bash
# Из корневой папки
npm run dev:backend  # Запуск backend
npm run dev:frontend # Запуск frontend
```

---

## 📝 Основные функции

### ✅ Управление задачами
- Создание, редактирование, удаление задач
- Фильтрация по статусу, приоритету, дате
- Отметка выполнения
- Поиск задач

### 📊 Аналитика
- Статистика по задачам
- Графики продуктивности
- Отчеты по периодам

### ⚙️ Настройки
- Профиль пользователя
- Безопасность
- Уведомления
- Тема оформления
- Управление данными

### 🔐 Аутентификация
- Регистрация и авторизация
- JWT токены
- Защищенные маршруты

---

## 🛠️ Технологии

### Frontend
- **Next.js 15.5.2** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Framer Motion** - Анимации
- **Lucide React** - Иконки

### Backend
- **PHP 8.4.12** - Серверный язык
- **Slim Framework** - Микрофреймворк
- **SQLite** - База данных
- **JWT** - Аутентификация

---

## 📚 Полезные команды

### Frontend
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен сборки
npm run lint         # Проверка кода
```

### Backend
```bash
composer install     # Установка зависимостей
composer update      # Обновление зависимостей
php -S localhost:8000 -t public  # Запуск сервера
```

---

## 🎯 Заключение

Этот проект представляет собой полнофункциональное приложение для управления задачами с современным дизайном и архитектурой. Frontend построен на Next.js с TypeScript, а backend на PHP с Slim Framework. Все компоненты хорошо структурированы и следуют принципам чистого кода.

**Основной блок задач** находится в `frontend/src/app/page.tsx` в функции `renderContent()` для случая `currentView === 'tasks'` и включает в себя фильтры, сетку задач, состояния загрузки и пустого состояния.

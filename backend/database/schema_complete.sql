-- 🐱 Полная схема базы данных Serenity для MySQL
-- Версия: 1.0.0
-- Дата создания: 2025-01-27

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS serenity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE serenity;

-- ==============================================
-- ОСНОВНЫЕ ТАБЛИЦЫ
-- ==============================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
    avatar VARCHAR(500) NULL,
    avatar_data LONGBLOB NULL,
    avatar_mime_type VARCHAR(100) NULL,
    avatar_size INT NULL,
    settings JSON NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    INDEX idx_avatar_size (avatar_size)
);

-- Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_by VARCHAR(36) NOT NULL,
    settings JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- Таблица участников команд
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by VARCHAR(36) NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_team_user (team_id, user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- Таблица приглашений в команды
CREATE TABLE IF NOT EXISTS team_invitations (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    token VARCHAR(64) UNIQUE NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    invited_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_created_at (created_at)
);

-- Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM('personal', 'work', 'health', 'learning', 'shopping', 'other') DEFAULT 'personal',
    due_date TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NULL,
    team_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_team_id (team_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at)
);

-- ==============================================
-- ТАБЛИЦЫ КОММЕНТАРИЕВ И ФАЙЛОВ
-- ==============================================

-- Таблица комментариев к задачам (личные)
CREATE TABLE IF NOT EXISTS task_comments (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Таблица комментариев к задачам команд
CREATE TABLE IF NOT EXISTS team_task_comments (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Таблица файлов команд
CREATE TABLE IF NOT EXISTS team_files (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NULL,
    project_id VARCHAR(36) NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_task_id (task_id),
    INDEX idx_project_id (project_id),
    INDEX idx_created_at (created_at)
);

-- ==============================================
-- ТАБЛИЦЫ ЧАТА И КОММУНИКАЦИИ
-- ==============================================

-- Таблица сообщений чата команд
CREATE TABLE IF NOT EXISTS team_chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    reply_to_id VARCHAR(36) NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES team_chat_messages(id) ON DELETE SET NULL,
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_reply_to_id (reply_to_id)
);

-- Таблица статусов прочтения сообщений
CREATE TABLE IF NOT EXISTS team_chat_read_status (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id)
);

-- ==============================================
-- ТАБЛИЦЫ КОЛЛАБОРАЦИИ И АКТИВНОСТИ
-- ==============================================

-- Таблица активности команд
CREATE TABLE IF NOT EXISTS team_collaboration (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    activity_type ENUM('task_created', 'task_updated', 'task_completed', 'project_created', 'project_updated', 'comment_added', 'file_uploaded', 'meeting_scheduled') NOT NULL,
    activity_data JSON NULL,
    target_id VARCHAR(36) NULL,
    target_type ENUM('task', 'project', 'team', 'user') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_target_id (target_id),
    INDEX idx_created_at (created_at)
);

-- Таблица онлайн статуса пользователей в командах
CREATE TABLE IF NOT EXISTS user_online_status (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NOT NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_team (user_id, team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_is_online (is_online),
    INDEX idx_last_seen (last_seen)
);

-- ==============================================
-- ТАБЛИЦЫ УВЕДОМЛЕНИЙ
-- ==============================================

-- Таблица уведомлений (личные)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Таблица уведомлений команд
CREATE TABLE IF NOT EXISTS team_notifications (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('task_assigned', 'task_updated', 'comment_added', 'file_uploaded', 'member_joined', 'member_left', 'project_updated') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ==============================================
-- ДОПОЛНИТЕЛЬНЫЕ ТАБЛИЦЫ (ОПЦИОНАЛЬНЫЕ)
-- ==============================================

-- Таблица тегов (для будущего использования)
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tag (user_id, name),
    INDEX idx_user_id (user_id)
);

-- Связующая таблица задач и тегов
CREATE TABLE IF NOT EXISTS task_tags (
    task_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ==============================================
-- ДЕМО-ДАННЫЕ
-- ==============================================

-- Вставка демо-пользователя
INSERT INTO users (id, email, name, password_hash, avatar, settings) VALUES
('user_demo_123', 'demo@serenity.com', 'Демо Пользователь', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', '{"theme": "dark", "language": "ru", "notifications": true}');

-- Вставка демо-команды
INSERT INTO teams (id, name, description, color, created_by) VALUES
('team_demo_123', 'Команда разработки', 'Основная команда для разработки продукта Serenity', '#3B82F6', 'user_demo_123');

-- Добавляем демо-пользователя в команду как владельца
INSERT INTO team_members (id, team_id, user_id, role, invited_by) VALUES
('tm_demo_123', 'team_demo_123', 'user_demo_123', 'owner', NULL);

-- Вставка демо-проектов
INSERT INTO projects (id, name, description, color, user_id, team_id) VALUES
('project_work_123', 'Работа', 'Рабочие задачи и проекты', '#3B82F6', 'user_demo_123', 'team_demo_123'),
('project_personal_123', 'Личные дела', 'Личные задачи и планы', '#10B981', 'user_demo_123', NULL),
('project_health_123', 'Здоровье', 'Задачи связанные со здоровьем', '#F59E0B', 'user_demo_123', NULL);

-- Вставка демо-тегов
INSERT INTO tags (id, name, color, user_id) VALUES
('tag_urgent_123', 'Срочно', '#EF4444', 'user_demo_123'),
('tag_important_123', 'Важно', '#F59E0B', 'user_demo_123'),
('tag_meeting_123', 'Встреча', '#8B5CF6', 'user_demo_123'),
('tag_development_123', 'Разработка', '#06B6D4', 'user_demo_123');

-- Вставка демо-задач
INSERT INTO tasks (id, title, description, status, priority, category, due_date, user_id, project_id, team_id) VALUES
('task_1_123', 'Завершить проект Serenity', 'Доработать функционал менеджера задач и добавить новые возможности', 'in_progress', 'high', 'work', '2025-09-15 18:00:00', 'user_demo_123', 'project_work_123', 'team_demo_123'),
('task_2_123', 'Купить продукты', 'Молоко, хлеб, яйца, овощи для ужина', 'pending', 'medium', 'shopping', '2025-09-10 20:00:00', 'user_demo_123', 'project_personal_123', NULL),
('task_3_123', 'Записаться к врачу', 'Плановый осмотр у терапевта', 'pending', 'medium', 'health', '2025-09-20 10:00:00', 'user_demo_123', 'project_health_123', NULL),
('task_4_123', 'Изучить React Three Fiber', 'Освоить 3D анимации для веб-приложений', 'completed', 'low', 'learning', '2025-09-08 15:00:00', 'user_demo_123', 'project_work_123', 'team_demo_123'),
('task_5_123', 'Встреча с командой', 'Обсуждение планов на следующую неделю', 'pending', 'high', 'work', '2025-09-11 14:00:00', 'user_demo_123', 'project_work_123', 'team_demo_123');

-- Связываем задачи с тегами
INSERT INTO task_tags (task_id, tag_id) VALUES
('task_1_123', 'tag_important_123'),
('task_1_123', 'tag_development_123'),
('task_2_123', 'tag_urgent_123'),
('task_5_123', 'tag_meeting_123'),
('task_5_123', 'tag_important_123');

-- Вставка демо-уведомлений
INSERT INTO notifications (id, user_id, title, message, type) VALUES
('notif_1_123', 'user_demo_123', 'Добро пожаловать в Serenity!', 'Ваш аккаунт успешно создан. Начните с создания первой задачи!', 'success'),
('notif_2_123', 'user_demo_123', 'Напоминание о задаче', 'Задача "Завершить проект Serenity" должна быть выполнена завтра', 'warning');

-- Вставка демо-активности команды
INSERT INTO team_collaboration (id, team_id, user_id, activity_type, activity_data, target_id, target_type) VALUES
('collab_1_123', 'team_demo_123', 'user_demo_123', 'task_created', '{"task_title": "Завершить проект Serenity"}', 'task_1_123', 'task'),
('collab_2_123', 'team_demo_123', 'user_demo_123', 'project_created', '{"project_name": "Работа"}', 'project_work_123', 'project');

-- Вставка демо-сообщений чата
INSERT INTO team_chat_messages (id, team_id, user_id, message, message_type) VALUES
('msg_1_123', 'team_demo_123', 'user_demo_123', 'Добро пожаловать в команду разработки!', 'text'),
('msg_2_123', 'team_demo_123', 'user_demo_123', 'Давайте обсудим планы на следующую неделю', 'text');

-- ==============================================
-- КОММЕНТАРИИ К СХЕМЕ
-- ==============================================

/*
СТРУКТУРА БАЗЫ ДАННЫХ SERENITY:

1. ОСНОВНЫЕ СУЩНОСТИ:
   - users: Пользователи системы
   - teams: Команды для совместной работы
   - projects: Проекты (личные и командные)
   - tasks: Задачи (личные и командные)

2. СВЯЗИ И ОТНОШЕНИЯ:
   - team_members: Участники команд с ролями
   - team_invitations: Приглашения в команды
   - task_comments: Комментарии к личным задачам
   - team_task_comments: Комментарии к командным задачам

3. КОММУНИКАЦИЯ:
   - team_chat_messages: Сообщения в чате команды
   - team_chat_read_status: Статусы прочтения сообщений
   - user_online_status: Онлайн статус пользователей

4. АКТИВНОСТЬ И КОЛЛАБОРАЦИЯ:
   - team_collaboration: Лог активности команды
   - team_files: Файлы команд
   - team_notifications: Уведомления команд

5. УВЕДОМЛЕНИЯ:
   - notifications: Личные уведомления
   - team_notifications: Уведомления команд

6. ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ:
   - tags: Теги для задач
   - task_tags: Связь задач и тегов

ОСОБЕННОСТИ:
- Все ID используют UUID (VARCHAR(36))
- Поддержка JSON полей для гибкости
- Каскадное удаление для связанных данных
- Индексы для оптимизации запросов
- Поддержка как личных, так и командных задач/проектов
- Система ролей в командах (owner, admin, member, viewer)
- Отслеживание активности и коллаборации
- Чат и уведомления в реальном времени
*/

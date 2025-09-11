-- 🐱 Схема базы данных Serenity для MySQL

-- Создание базы данных (если не существует)
CREATE DATABASE IF NOT EXISTS serenity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE serenity;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NULL,
    settings JSON NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('todo', 'in_progress', 'completed', 'cancelled') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM('personal', 'work', 'health', 'learning', 'shopping', 'other') DEFAULT 'personal',
    due_date TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at)
);

-- Таблица тегов
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

-- Таблица уведомлений
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

-- Вставка демо-данных
INSERT INTO users (id, email, name, password_hash, avatar, settings) VALUES
('user_demo_123', 'demo@serenity.com', 'Демо Пользователь', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', '{"theme": "dark", "language": "ru", "notifications": true}');

INSERT INTO projects (id, name, description, color, user_id) VALUES
('project_work_123', 'Работа', 'Рабочие задачи и проекты', '#3B82F6', 'user_demo_123'),
('project_personal_123', 'Личные дела', 'Личные задачи и планы', '#10B981', 'user_demo_123'),
('project_health_123', 'Здоровье', 'Задачи связанные со здоровьем', '#F59E0B', 'user_demo_123');

INSERT INTO tags (id, name, color, user_id) VALUES
('tag_urgent_123', 'Срочно', '#EF4444', 'user_demo_123'),
('tag_important_123', 'Важно', '#F59E0B', 'user_demo_123'),
('tag_meeting_123', 'Встреча', '#8B5CF6', 'user_demo_123'),
('tag_development_123', 'Разработка', '#06B6D4', 'user_demo_123');

INSERT INTO tasks (id, title, description, status, priority, category, due_date, user_id, project_id) VALUES
('task_1_123', 'Завершить проект Serenity', 'Доработать функционал менеджера задач и добавить новые возможности', 'in_progress', 'high', 'work', '2025-09-15 18:00:00', 'user_demo_123', 'project_work_123'),
('task_2_123', 'Купить продукты', 'Молоко, хлеб, яйца, овощи для ужина', 'todo', 'medium', 'shopping', '2025-09-10 20:00:00', 'user_demo_123', 'project_personal_123'),
('task_3_123', 'Записаться к врачу', 'Плановый осмотр у терапевта', 'todo', 'medium', 'health', '2025-09-20 10:00:00', 'user_demo_123', 'project_health_123'),
('task_4_123', 'Изучить React Three Fiber', 'Освоить 3D анимации для веб-приложений', 'completed', 'low', 'learning', '2025-09-08 15:00:00', 'user_demo_123', 'project_work_123'),
('task_5_123', 'Встреча с командой', 'Обсуждение планов на следующую неделю', 'todo', 'high', 'work', '2025-09-11 14:00:00', 'user_demo_123', 'project_work_123');

-- Связываем задачи с тегами
INSERT INTO task_tags (task_id, tag_id) VALUES
('task_1_123', 'tag_important_123'),
('task_1_123', 'tag_development_123'),
('task_2_123', 'tag_urgent_123'),
('task_5_123', 'tag_meeting_123'),
('task_5_123', 'tag_important_123');

INSERT INTO notifications (id, user_id, title, message, type) VALUES
('notif_1_123', 'user_demo_123', 'Добро пожаловать в Serenity!', 'Ваш аккаунт успешно создан. Начните с создания первой задачи!', 'success'),
('notif_2_123', 'user_demo_123', 'Напоминание о задаче', 'Задача "Завершить проект Serenity" должна быть выполнена завтра', 'warning');
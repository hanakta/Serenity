-- Миграция для добавления команд и коллаборации

-- Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    avatar VARCHAR(500) NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    owner_id VARCHAR(36) NOT NULL,
    settings JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_created_at (created_at)
);

-- Таблица участников команд
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'member', 'viewer') DEFAULT 'member',
    permissions JSON NULL,
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
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by VARCHAR(36) NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- Таблица проектов команд
CREATE TABLE IF NOT EXISTS team_projects (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- Обновляем таблицу задач для поддержки команд
ALTER TABLE tasks ADD COLUMN team_id VARCHAR(36) NULL AFTER project_id;
ALTER TABLE tasks ADD COLUMN assigned_to VARCHAR(36) NULL AFTER team_id;
ALTER TABLE tasks ADD COLUMN created_by VARCHAR(36) NULL AFTER assigned_to;

-- Добавляем внешние ключи для команд
ALTER TABLE tasks ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Добавляем индексы
ALTER TABLE tasks ADD INDEX idx_team_id (team_id);
ALTER TABLE tasks ADD INDEX idx_assigned_to (assigned_to);
ALTER TABLE tasks ADD INDEX idx_created_by (created_by);

-- Таблица комментариев к задачам
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

-- Таблица активности (история изменений)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NULL,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Демо-данные для команд
INSERT INTO teams (id, name, description, color, owner_id, settings) VALUES
('team_dev_123', 'Команда разработки', 'Основная команда разработчиков проекта Serenity', '#3B82F6', 'user_demo_123', '{"notifications": true, "auto_assign": false}'),
('team_design_123', 'Команда дизайна', 'UI/UX дизайнеры и маркетологи', '#8B5CF6', 'user_demo_123', '{"notifications": true, "auto_assign": true}');

-- Добавляем владельца в команды
INSERT INTO team_members (id, team_id, user_id, role, invited_by) VALUES
('member_1_123', 'team_dev_123', 'user_demo_123', 'owner', NULL),
('member_2_123', 'team_design_123', 'user_demo_123', 'owner', NULL);

-- Создаем демо-проекты команд
INSERT INTO team_projects (id, team_id, name, description, color, created_by) VALUES
('team_project_1_123', 'team_dev_123', 'Backend API', 'Разработка API для менеджера задач', '#3B82F6', 'user_demo_123'),
('team_project_2_123', 'team_dev_123', 'Frontend React', 'Пользовательский интерфейс', '#10B981', 'user_demo_123'),
('team_project_3_123', 'team_design_123', 'UI/UX Design', 'Дизайн интерфейса и пользовательский опыт', '#8B5CF6', 'user_demo_123');

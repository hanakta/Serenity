-- 🐱 Миграция для добавления системы команд в Serenity

-- Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
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

-- Добавляем поле team_id в таблицу задач для связи с командами
ALTER TABLE tasks ADD COLUMN team_id VARCHAR(36) NULL;
ALTER TABLE tasks ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD INDEX idx_team_id (team_id);

-- Добавляем поле team_id в таблицу проектов для связи с командами
ALTER TABLE projects ADD COLUMN team_id VARCHAR(36) NULL;
ALTER TABLE projects ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE projects ADD INDEX idx_team_id (team_id);

-- Вставляем демо-команду
INSERT INTO teams (id, name, description, color, owner_id) VALUES
('team_demo_123', 'Команда разработки', 'Основная команда для разработки продукта Serenity', '#3B82F6', 'user_demo_123');

-- Добавляем демо-пользователя в команду как владельца
INSERT INTO team_members (id, team_id, user_id, role, invited_by) VALUES
('tm_demo_123', 'team_demo_123', 'user_demo_123', 'owner', NULL);

-- Обновляем демо-задачи, привязывая их к команде
UPDATE tasks SET team_id = 'team_demo_123' WHERE id IN ('task_1_123', 'task_5_123');

-- Обновляем демо-проект, привязывая его к команде
UPDATE projects SET team_id = 'team_demo_123' WHERE id = 'project_work_123';


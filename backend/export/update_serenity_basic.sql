-- 🔄 Базовое обновление существующей базы данных serenity
-- Выполните этот скрипт в PHPMyAdmin на вкладке SQL

-- 1. Создаем таблицы для команд
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_team_user (team_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_invitations (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    invited_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE task_comments (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Добавляем колонку team_id к существующим таблицам
ALTER TABLE tasks ADD COLUMN team_id VARCHAR(36) NULL;
ALTER TABLE projects ADD COLUMN team_id VARCHAR(36) NULL;

-- 3. Добавляем внешние ключи
ALTER TABLE teams ADD FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE team_invitations ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE team_invitations ADD FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE activity_logs ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE activity_logs ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE projects ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Создаем индексы
CREATE INDEX idx_teams_owner_id ON teams (owner_id);
CREATE INDEX idx_team_members_team_id ON team_members (team_id);
CREATE INDEX idx_team_members_user_id ON team_members (user_id);
CREATE INDEX idx_tasks_team_id ON tasks (team_id);
CREATE INDEX idx_projects_team_id ON projects (team_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX idx_activity_logs_team_id ON activity_logs (team_id);

-- 5. Вставляем демо данные для команд
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES 
('team-demo-1', 'Команда разработки', 'Основная команда разработки продукта', '#3B82F6', (SELECT id FROM users LIMIT 1), NOW(), NOW()),
('team-demo-2', 'Маркетинг', 'Команда маркетинга и продвижения', '#10B981', (SELECT id FROM users LIMIT 1), NOW(), NOW()),
('team-demo-3', 'Дизайн', 'Команда дизайнеров и UX', '#8B5CF6', (SELECT id FROM users LIMIT 1), NOW(), NOW());

-- 6. Добавляем участников команд
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES 
('member-1', 'team-demo-1', (SELECT id FROM users LIMIT 1), 'admin', NOW()),
('member-2', 'team-demo-1', (SELECT id FROM users LIMIT 1 OFFSET 1), 'member', NOW()),
('member-3', 'team-demo-2', (SELECT id FROM users LIMIT 1), 'admin', NOW()),
('member-4', 'team-demo-2', (SELECT id FROM users LIMIT 1 OFFSET 2), 'member', NOW()),
('member-5', 'team-demo-3', (SELECT id FROM users LIMIT 1), 'admin', NOW());

-- 7. Обновляем некоторые существующие задачи, добавляя team_id
UPDATE tasks SET team_id = 'team-demo-1' WHERE id IN (SELECT id FROM tasks LIMIT 3);
UPDATE tasks SET team_id = 'team-demo-2' WHERE id IN (SELECT id FROM tasks LIMIT 2 OFFSET 3);

-- 8. Обновляем некоторые существующие проекты, добавляя team_id
UPDATE projects SET team_id = 'team-demo-1' WHERE id IN (SELECT id FROM projects LIMIT 1);
UPDATE projects SET team_id = 'team-demo-2' WHERE id IN (SELECT id FROM projects LIMIT 1 OFFSET 1);

-- 9. Добавляем демо комментарии к задачам
INSERT INTO task_comments (id, task_id, user_id, content, created_at) VALUES 
('comment-1', (SELECT id FROM tasks LIMIT 1), (SELECT id FROM users LIMIT 1), 'Отличная работа! Продолжайте в том же духе.', NOW()),
('comment-2', (SELECT id FROM tasks LIMIT 1), (SELECT id FROM users LIMIT 1 OFFSET 1), 'Нужно доработать детали.', NOW()),
('comment-3', (SELECT id FROM tasks LIMIT 1 OFFSET 1), (SELECT id FROM users LIMIT 1), 'Готово к тестированию.', NOW());

-- 10. Добавляем демо логи активности
INSERT INTO activity_logs (id, user_id, team_id, action, description, metadata, created_at) VALUES 
('log-1', (SELECT id FROM users LIMIT 1), 'team-demo-1', 'team_created', 'Создана команда разработки', '{"team_name": "Команда разработки"}', NOW()),
('log-2', (SELECT id FROM users LIMIT 1), 'team-demo-1', 'task_created', 'Создана новая задача', '{"task_title": "Разработка нового функционала"}', NOW()),
('log-3', (SELECT id FROM users LIMIT 1), 'team-demo-2', 'member_joined', 'Новый участник присоединился к команде', '{"member_name": "Анна Петрова"}', NOW());

-- Готово! Теперь ваша база данных обновлена с поддержкой команд


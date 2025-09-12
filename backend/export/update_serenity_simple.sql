-- 🔄 Упрощенное обновление существующей базы данных serenity
-- Выполните этот скрипт в PHPMyAdmin на вкладке SQL

-- 1. Создаем таблицы для команд
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_invitations (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    invited_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_comments (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Добавляем колонку team_id к существующим таблицам (если её нет)
-- Сначала проверяем, существует ли колонка
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'tasks' 
     AND column_name = 'team_id') = 0,
    'ALTER TABLE tasks ADD COLUMN team_id VARCHAR(36) NULL',
    'SELECT "Column team_id already exists in tasks"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'projects' 
     AND column_name = 'team_id') = 0,
    'ALTER TABLE projects ADD COLUMN team_id VARCHAR(36) NULL',
    'SELECT "Column team_id already exists in projects"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Добавляем внешние ключи (если их нет)
-- Проверяем и добавляем внешний ключ для tasks.team_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'tasks' 
     AND column_name = 'team_id' 
     AND referenced_table_name = 'teams') = 0,
    'ALTER TABLE tasks ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists for tasks.team_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для projects.team_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'projects' 
     AND column_name = 'team_id' 
     AND referenced_table_name = 'teams') = 0,
    'ALTER TABLE projects ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists for projects.team_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Создаем индексы (с проверкой существования)
-- Проверяем и создаем индексы только если они не существуют
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'teams' 
     AND index_name = 'idx_teams_owner_id') = 0,
    'CREATE INDEX idx_teams_owner_id ON teams (owner_id)',
    'SELECT "Index idx_teams_owner_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'team_members' 
     AND index_name = 'idx_team_members_team_id') = 0,
    'CREATE INDEX idx_team_members_team_id ON team_members (team_id)',
    'SELECT "Index idx_team_members_team_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'team_members' 
     AND index_name = 'idx_team_members_user_id') = 0,
    'CREATE INDEX idx_team_members_user_id ON team_members (user_id)',
    'SELECT "Index idx_team_members_user_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'tasks' 
     AND index_name = 'idx_tasks_team_id') = 0,
    'CREATE INDEX idx_tasks_team_id ON tasks (team_id)',
    'SELECT "Index idx_tasks_team_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'projects' 
     AND index_name = 'idx_projects_team_id') = 0,
    'CREATE INDEX idx_projects_team_id ON projects (team_id)',
    'SELECT "Index idx_projects_team_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'activity_logs' 
     AND index_name = 'idx_activity_logs_user_id') = 0,
    'CREATE INDEX idx_activity_logs_user_id ON activity_logs (user_id)',
    'SELECT "Index idx_activity_logs_user_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE table_schema = DATABASE() 
     AND table_name = 'activity_logs' 
     AND index_name = 'idx_activity_logs_team_id') = 0,
    'CREATE INDEX idx_activity_logs_team_id ON activity_logs (team_id)',
    'SELECT "Index idx_activity_logs_team_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

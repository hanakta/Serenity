-- 🔄 Минимальное обновление существующей базы данных serenity
-- Выполните этот скрипт в PHPMyAdmin на вкладке SQL

-- 1. Создаем таблицы для команд (только если их нет)
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_team_user (team_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_invitations (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    invited_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_comments (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Добавляем колонку team_id к существующим таблицам (только если её нет)
-- Проверяем, существует ли колонка team_id в таблице tasks
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

-- Проверяем, существует ли колонка team_id в таблице projects
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

-- 3. Добавляем внешние ключи (только если их нет)
-- Проверяем и добавляем внешний ключ для teams.owner_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'teams' 
     AND column_name = 'owner_id' 
     AND referenced_table_name = 'users') = 0,
    'ALTER TABLE teams ADD FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for teams.owner_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для team_members.team_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'team_members' 
     AND column_name = 'team_id' 
     AND referenced_table_name = 'teams') = 0,
    'ALTER TABLE team_members ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for team_members.team_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для team_members.user_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'team_members' 
     AND column_name = 'user_id' 
     AND referenced_table_name = 'users') = 0,
    'ALTER TABLE team_members ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for team_members.user_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для team_invitations.team_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'team_invitations' 
     AND column_name = 'team_id' 
     AND referenced_table_name = 'teams') = 0,
    'ALTER TABLE team_invitations ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for team_invitations.team_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для team_invitations.invited_by
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'team_invitations' 
     AND column_name = 'invited_by' 
     AND referenced_table_name = 'users') = 0,
    'ALTER TABLE team_invitations ADD FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for team_invitations.invited_by"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для task_comments.task_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'task_comments' 
     AND column_name = 'task_id' 
     AND referenced_table_name = 'tasks') = 0,
    'ALTER TABLE task_comments ADD FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for task_comments.task_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для task_comments.user_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'task_comments' 
     AND column_name = 'user_id' 
     AND referenced_table_name = 'users') = 0,
    'ALTER TABLE task_comments ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for task_comments.user_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для activity_logs.user_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'activity_logs' 
     AND column_name = 'user_id' 
     AND referenced_table_name = 'users') = 0,
    'ALTER TABLE activity_logs ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists for activity_logs.user_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверяем и добавляем внешний ключ для activity_logs.team_id
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() 
     AND table_name = 'activity_logs' 
     AND column_name = 'team_id' 
     AND referenced_table_name = 'teams') = 0,
    'ALTER TABLE activity_logs ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists for activity_logs.team_id"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

-- 4. Вставляем демо данные для команд (только если их нет)
INSERT IGNORE INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES 
('team-demo-1', 'Команда разработки', 'Основная команда разработки продукта', '#3B82F6', (SELECT id FROM users LIMIT 1), NOW(), NOW()),
('team-demo-2', 'Маркетинг', 'Команда маркетинга и продвижения', '#10B981', (SELECT id FROM users LIMIT 1), NOW(), NOW()),
('team-demo-3', 'Дизайн', 'Команда дизайнеров и UX', '#8B5CF6', (SELECT id FROM users LIMIT 1), NOW(), NOW());

-- 5. Добавляем участников команд (только если их нет)
INSERT IGNORE INTO team_members (id, team_id, user_id, role, joined_at) VALUES 
('member-1', 'team-demo-1', (SELECT id FROM users LIMIT 1), 'admin', NOW()),
('member-2', 'team-demo-1', (SELECT id FROM users LIMIT 1 OFFSET 1), 'member', NOW()),
('member-3', 'team-demo-2', (SELECT id FROM users LIMIT 1), 'admin', NOW()),
('member-4', 'team-demo-2', (SELECT id FROM users LIMIT 1 OFFSET 2), 'member', NOW()),
('member-5', 'team-demo-3', (SELECT id FROM users LIMIT 1), 'admin', NOW());

-- 6. Обновляем некоторые существующие задачи, добавляя team_id
UPDATE tasks SET team_id = 'team-demo-1' WHERE team_id IS NULL AND id IN (SELECT id FROM tasks WHERE team_id IS NULL LIMIT 3);

UPDATE tasks SET team_id = 'team-demo-2' WHERE team_id IS NULL AND id IN (SELECT id FROM tasks WHERE team_id IS NULL LIMIT 2 OFFSET 3);

-- 7. Обновляем некоторые существующие проекты, добавляя team_id
UPDATE projects SET team_id = 'team-demo-1' WHERE team_id IS NULL AND id IN (SELECT id FROM projects WHERE team_id IS NULL LIMIT 1);

UPDATE projects SET team_id = 'team-demo-2' WHERE team_id IS NULL AND id IN (SELECT id FROM projects WHERE team_id IS NULL LIMIT 1 OFFSET 1);

-- 8. Добавляем демо комментарии к задачам (только если их нет)
INSERT IGNORE INTO task_comments (id, task_id, user_id, content, created_at) VALUES 
('comment-1', (SELECT id FROM tasks LIMIT 1), (SELECT id FROM users LIMIT 1), 'Отличная работа! Продолжайте в том же духе.', NOW()),
('comment-2', (SELECT id FROM tasks LIMIT 1), (SELECT id FROM users LIMIT 1 OFFSET 1), 'Нужно доработать детали.', NOW()),
('comment-3', (SELECT id FROM tasks LIMIT 1 OFFSET 1), (SELECT id FROM users LIMIT 1), 'Готово к тестированию.', NOW());

-- 9. Добавляем демо логи активности (только если их нет)
INSERT IGNORE INTO activity_logs (id, user_id, team_id, action, description, metadata, created_at) VALUES 
('log-1', (SELECT id FROM users LIMIT 1), 'team-demo-1', 'team_created', 'Создана команда разработки', '{"team_name": "Команда разработки"}', NOW()),
('log-2', (SELECT id FROM users LIMIT 1), 'team-demo-1', 'task_created', 'Создана новая задача', '{"task_title": "Разработка нового функционала"}', NOW()),
('log-3', (SELECT id FROM users LIMIT 1), 'team-demo-2', 'member_joined', 'Новый участник присоединился к команде', '{"member_name": "Анна Петрова"}', NOW());

-- Готово! Теперь ваша база данных обновлена с поддержкой команд

-- Простая миграция для добавления команд (SQLite)

-- Таблица команд
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    color TEXT DEFAULT '#3B82F6',
    owner_id TEXT NOT NULL,
    settings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица участников команд
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    permissions TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    invited_by TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(team_id, user_id)
);

-- Таблица приглашений в команды
CREATE TABLE IF NOT EXISTS team_invitations (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    token TEXT UNIQUE NOT NULL,
    invited_by TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица проектов команд
CREATE TABLE IF NOT EXISTS team_projects (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица комментариев к задачам
CREATE TABLE IF NOT EXISTS task_comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица активности (история изменений)
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    team_id TEXT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_team_projects_team_id ON team_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_created_by ON team_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_team_projects_created_at ON team_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON activity_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

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

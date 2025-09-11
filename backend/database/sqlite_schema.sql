-- 🐱 SQLite схема базы данных для Serenity

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    settings TEXT,
    email_verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица тегов
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'work', 'creative', 'health', 'learning', 'other')),
    due_date DATETIME,
    completed_at DATETIME,
    user_id TEXT NOT NULL,
    project_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Связующая таблица для тегов задач
CREATE TABLE IF NOT EXISTS task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    type TEXT NOT NULL CHECK (type IN ('task_due', 'task_completed', 'project_update', 'team_invite')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id TEXT NOT NULL,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Вставка демо-данных
INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES 
('demo-user-0000-0000-0000-000000000001', 'demo@serenity.com', 'Demo User', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Создание демо-проекта
INSERT OR IGNORE INTO projects (id, name, description, color, user_id) VALUES 
('demo-project-0000-0000-0000-000000000001', 'Личные задачи', 'Мои личные задачи и планы', '#3B82F6', 'demo-user-0000-0000-0000-000000000001'),
('demo-project-0000-0000-0000-000000000002', 'Работа', 'Рабочие проекты и задачи', '#10B981', 'demo-user-0000-0000-0000-000000000001');

-- Создание демо-тегов
INSERT OR IGNORE INTO tags (id, name, color, user_id) VALUES 
('demo-tag-0000-0000-0000-000000000001', 'важно', '#EF4444', 'demo-user-0000-0000-0000-000000000001'),
('demo-tag-0000-0000-0000-000000000002', 'срочно', '#F59E0B', 'demo-user-0000-0000-0000-000000000001'),
('demo-tag-0000-0000-0000-000000000003', 'идея', '#8B5CF6', 'demo-user-0000-0000-0000-000000000001');

-- Создание демо-задач
INSERT OR IGNORE INTO tasks (id, title, description, status, priority, category, user_id, project_id) VALUES 
('demo-task-0000-0000-0000-000000000001', 'Изучить новый фреймворк', 'Потратить 2 часа на изучение документации', 'todo', 'high', 'learning', 'demo-user-0000-0000-0000-000000000001', 'demo-project-0000-0000-0000-000000000002'),
('demo-task-0000-0000-0000-000000000002', 'Купить продукты', 'Молоко, хлеб, яйца', 'todo', 'medium', 'personal', 'demo-user-0000-0000-0000-000000000001', 'demo-project-0000-0000-0000-000000000001'),
('demo-task-0000-0000-0000-000000000003', 'Записаться к врачу', 'Проверить здоровье', 'completed', 'high', 'health', 'demo-user-0000-0000-0000-000000000001', 'demo-project-0000-0000-0000-000000000001');

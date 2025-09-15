-- 🐱 Миграция для добавления team_id в таблицу projects

-- Добавляем поле team_id в таблицу projects
ALTER TABLE projects ADD COLUMN team_id TEXT;

-- Добавляем индекс для team_id
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);


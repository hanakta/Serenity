-- 🐱 Миграция для добавления team_id в таблицу tasks

-- Добавляем поле team_id в таблицу tasks
ALTER TABLE tasks ADD COLUMN team_id TEXT;

-- Добавляем внешний ключ
-- SQLite не поддерживает ADD CONSTRAINT, поэтому создадим индекс
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);

-- Добавляем комментарий (SQLite не поддерживает COMMENT, но оставим для документации)
-- team_id - ID команды, к которой принадлежит задача


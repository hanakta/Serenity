-- Миграция: добавление колонки completed_at в таблицу tasks
USE serenity;

ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP NULL AFTER due_date;



-- 🐱 Миграция для добавления полей аватара в таблицу users

-- Добавляем поля для хранения аватара в базе данных
ALTER TABLE users ADD COLUMN avatar_data TEXT;
ALTER TABLE users ADD COLUMN avatar_mime_type TEXT;
ALTER TABLE users ADD COLUMN avatar_size INTEGER;


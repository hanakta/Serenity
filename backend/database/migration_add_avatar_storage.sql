-- 🐱 Миграция для добавления хранения аватарок в базе данных
-- Выполнить после основной схемы

-- Добавляем новые поля для хранения аватарок в таблицу users
ALTER TABLE users ADD COLUMN avatar_data LONGBLOB NULL;
ALTER TABLE users ADD COLUMN avatar_mime_type VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN avatar_size INT NULL;

-- Создаем индекс для оптимизации поиска по размеру аватарок
CREATE INDEX idx_avatar_size ON users(avatar_size);

-- Комментарии к новым полям
ALTER TABLE users MODIFY COLUMN avatar_data LONGBLOB NULL COMMENT 'Данные аватарки в base64 или бинарном формате';
ALTER TABLE users MODIFY COLUMN avatar_mime_type VARCHAR(100) NULL COMMENT 'MIME тип аватарки (image/jpeg, image/png, etc.)';
ALTER TABLE users MODIFY COLUMN avatar_size INT NULL COMMENT 'Размер аватарки в байтах';

-- Обновляем существующие записи (если есть)
-- Если в поле avatar есть URL, можно оставить его для обратной совместимости
-- Новые аватарки будут сохраняться в avatar_data




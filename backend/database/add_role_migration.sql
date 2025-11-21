-- Миграция для добавления поля role в таблицу users
-- Выполнить этот скрипт для обновления существующей базы данных

-- Добавляем поле role в таблицу users
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin', 'super_admin') DEFAULT 'user';

-- Добавляем индекс для поля role
ALTER TABLE users ADD INDEX idx_role (role);

-- Обновляем существующих пользователей (все становятся обычными пользователями)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Создаем первого супер-администратора (замените на нужный email)
-- UPDATE users SET role = 'super_admin' WHERE email = 'admin@serenity.com';


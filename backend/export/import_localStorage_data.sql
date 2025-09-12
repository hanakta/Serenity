-- 📥 Импорт данных из localStorage в существующую базу serenity
-- Выполните этот скрипт ПОСЛЕ выполнения update_serenity_database.sql

-- 1. Импортируем команды из localStorage (пример данных)
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES 
('team-local-1', 'Команда разработки', 'Основная команда разработки продукта', '#3B82F6', (SELECT id FROM users LIMIT 1), '2025-01-11 10:00:00', '2025-01-11 10:00:00'),
('team-local-2', 'Маркетинг', 'Команда маркетинга и продвижения', '#10B981', (SELECT id FROM users LIMIT 1), '2025-01-11 11:00:00', '2025-01-11 11:00:00'),
('team-local-3', 'Дизайн', 'Команда дизайнеров и UX', '#8B5CF6', (SELECT id FROM users LIMIT 1), '2025-01-11 12:00:00', '2025-01-11 12:00:00'),
('team-local-4', 'Тестирование', 'QA команда', '#F59E0B', (SELECT id FROM users LIMIT 1), '2025-01-11 13:00:00', '2025-01-11 13:00:00'),
('team-local-5', 'DevOps', 'Команда инфраструктуры', '#EF4444', (SELECT id FROM users LIMIT 1), '2025-01-11 14:00:00', '2025-01-11 14:00:00')
ON DUPLICATE KEY UPDATE 
name = VALUES(name), 
description = VALUES(description), 
color = VALUES(color),
updated_at = VALUES(updated_at);

-- 2. Импортируем участников команд
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES 
-- Команда разработки
('local-member-1', 'team-local-1', (SELECT id FROM users LIMIT 1), 'admin', '2025-01-11 10:00:00'),
('local-member-2', 'team-local-1', (SELECT id FROM users LIMIT 1 OFFSET 1), 'member', '2025-01-11 10:30:00'),
('local-member-3', 'team-local-1', (SELECT id FROM users LIMIT 1 OFFSET 2), 'member', '2025-01-11 11:00:00'),

-- Команда маркетинга
('local-member-4', 'team-local-2', (SELECT id FROM users LIMIT 1), 'admin', '2025-01-11 11:00:00'),
('local-member-5', 'team-local-2', (SELECT id FROM users LIMIT 1 OFFSET 1), 'member', '2025-01-11 11:15:00'),

-- Команда дизайна
('local-member-6', 'team-local-3', (SELECT id FROM users LIMIT 1), 'admin', '2025-01-11 12:00:00'),
('local-member-7', 'team-local-3', (SELECT id FROM users LIMIT 1 OFFSET 2), 'member', '2025-01-11 12:30:00'),

-- Команда тестирования
('local-member-8', 'team-local-4', (SELECT id FROM users LIMIT 1), 'admin', '2025-01-11 13:00:00'),
('local-member-9', 'team-local-4', (SELECT id FROM users LIMIT 1 OFFSET 1), 'member', '2025-01-11 13:15:00'),

-- Команда DevOps
('local-member-10', 'team-local-5', (SELECT id FROM users LIMIT 1), 'admin', '2025-01-11 14:00:00'),
('local-member-11', 'team-local-5', (SELECT id FROM users LIMIT 1 OFFSET 2), 'member', '2025-01-11 14:30:00')
ON DUPLICATE KEY UPDATE 
role = VALUES(role);

-- 3. Импортируем совместные задачи
INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, created_at, updated_at) VALUES 
('local-task-1', 'Разработать новый функционал', 'Создать систему уведомлений для команд', 'in_progress', 'high', (SELECT id FROM users LIMIT 1), 'team-local-1', '2025-01-15 18:00:00', '2025-01-11 12:00:00', '2025-01-11 12:00:00'),
('local-task-2', 'Создать лендинг страницу', 'Разработать главную страницу продукта', 'todo', 'medium', (SELECT id FROM users LIMIT 1), 'team-local-2', '2025-01-20 17:00:00', '2025-01-11 13:00:00', '2025-01-11 13:00:00'),
('local-task-3', 'Дизайн мобильного приложения', 'Создать UI/UX для мобильной версии', 'todo', 'high', (SELECT id FROM users LIMIT 1), 'team-local-3', '2025-01-18 16:00:00', '2025-01-11 14:00:00', '2025-01-11 14:00:00'),
('local-task-4', 'Тестирование API', 'Провести полное тестирование API endpoints', 'in_progress', 'medium', (SELECT id FROM users LIMIT 1), 'team-local-4', '2025-01-16 15:00:00', '2025-01-11 15:00:00', '2025-01-11 15:00:00'),
('local-task-5', 'Настройка CI/CD', 'Автоматизация развертывания', 'done', 'high', (SELECT id FROM users LIMIT 1), 'team-local-5', '2025-01-12 14:00:00', '2025-01-11 16:00:00', '2025-01-11 16:00:00')
ON DUPLICATE KEY UPDATE 
title = VALUES(title), 
description = VALUES(description), 
status = VALUES(status),
priority = VALUES(priority),
due_date = VALUES(due_date),
updated_at = VALUES(updated_at);

-- 4. Импортируем комментарии к задачам
INSERT INTO task_comments (id, task_id, user_id, content, created_at) VALUES 
('local-comment-1', 'local-task-1', (SELECT id FROM users LIMIT 1), 'Привет! Как дела с новым функционалом?', '2025-01-11 14:00:00'),
('local-comment-2', 'local-task-1', (SELECT id FROM users LIMIT 1 OFFSET 1), 'Работаем над этим, скоро будет готово!', '2025-01-11 14:15:00'),
('local-comment-3', 'local-task-2', (SELECT id FROM users LIMIT 1), 'Нужно добавить больше анимаций', '2025-01-11 15:00:00'),
('local-comment-4', 'local-task-3', (SELECT id FROM users LIMIT 1), 'Дизайн выглядит отлично! 👍', '2025-01-11 16:00:00'),
('local-comment-5', 'local-task-4', (SELECT id FROM users LIMIT 1), 'Все тесты прошли успешно', '2025-01-11 17:00:00')
ON DUPLICATE KEY UPDATE 
content = VALUES(content);

-- 5. Импортируем сообщения чата как логи активности
INSERT INTO activity_logs (id, user_id, team_id, action, description, metadata, created_at) VALUES 
('local-log-1', (SELECT id FROM users LIMIT 1), 'team-local-1', 'chat_message', 'Привет! Как дела с новым функционалом?', '{"type": "text", "reactions": [{"emoji": "👍", "count": 2, "users": ["user1", "user2"]}]}', '2025-01-11 14:00:00'),
('local-log-2', (SELECT id FROM users LIMIT 1 OFFSET 1), 'team-local-1', 'chat_message', 'Работаем над этим, скоро будет готово!', '{"type": "text", "reactions": []}', '2025-01-11 14:15:00'),
('local-log-3', (SELECT id FROM users LIMIT 1), 'team-local-2', 'chat_message', 'Лендинг страница готова на 80%', '{"type": "text", "reactions": [{"emoji": "🚀", "count": 1, "users": ["user1"]}]}', '2025-01-11 15:30:00'),
('local-log-4', (SELECT id FROM users LIMIT 1), 'team-local-3', 'chat_message', 'Дизайн мобильного приложения готов!', '{"type": "text", "reactions": [{"emoji": "🎨", "count": 3, "users": ["user1", "user2", "user3"]}]}', '2025-01-11 16:45:00'),
('local-log-5', (SELECT id FROM users LIMIT 1), 'team-local-4', 'chat_message', 'Все тесты API прошли успешно ✅', '{"type": "text", "reactions": [{"emoji": "✅", "count": 2, "users": ["user1", "user2"]}]}', '2025-01-11 17:30:00')
ON DUPLICATE KEY UPDATE 
description = VALUES(description),
metadata = VALUES(metadata);

-- 6. Обновляем существующие проекты с team_id
UPDATE projects SET team_id = 'team-local-1' WHERE id IN (SELECT id FROM projects LIMIT 1);
UPDATE projects SET team_id = 'team-local-2' WHERE id IN (SELECT id FROM projects LIMIT 1 OFFSET 1);
UPDATE projects SET team_id = 'team-local-3' WHERE id IN (SELECT id FROM projects LIMIT 1 OFFSET 2);

-- Готово! Данные из localStorage импортированы в базу данных


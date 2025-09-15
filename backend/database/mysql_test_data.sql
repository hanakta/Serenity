-- 🐱 Тестовые данные для базы данных Serenity MySQL

USE serenity_db;

-- Очистка существующих данных (осторожно!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE team_chat_read_status;
TRUNCATE TABLE team_chat_messages;
TRUNCATE TABLE team_notifications;
TRUNCATE TABLE team_files;
TRUNCATE TABLE team_task_comments;
TRUNCATE TABLE team_collaboration;
TRUNCATE TABLE task_comments;
TRUNCATE TABLE tasks;
TRUNCATE TABLE projects;
TRUNCATE TABLE team_members;
TRUNCATE TABLE teams;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Тестовые пользователи
INSERT INTO users (id, name, email, password, created_at) VALUES
('user_68c415fd5a64e6.76941491', 'Test User', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW()),
('demo-user-0000-0000-0000-000000000001', 'Demo User', 'demo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW()),
('user_68c3020149e1b6.11548842', 'Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());

-- Тестовые команды
INSERT INTO teams (id, name, description, color, created_by, created_at) VALUES
('team_dev_123', 'Development Team', 'Команда разработчиков', '#3B82F6', 'user_68c415fd5a64e6.76941491', NOW()),
('team_68c3020149e1b6.11548842', 'Marketing Team', 'Команда маркетинга', '#10B981', 'demo-user-0000-0000-0000-000000000001', NOW()),
('team_design_456', 'Design Team', 'Команда дизайнеров', '#F59E0B', 'user_68c3020149e1b6.11548842', NOW());

-- Участники команд
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES
('tm_1', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'owner', NOW()),
('tm_2', 'team_dev_123', 'demo-user-0000-0000-0000-000000000001', 'admin', NOW()),
('tm_3', 'team_dev_123', 'user_68c3020149e1b6.11548842', 'member', NOW()),
('tm_4', 'team_68c3020149e1b6.11548842', 'demo-user-0000-0000-0000-000000000001', 'owner', NOW()),
('tm_5', 'team_design_456', 'user_68c3020149e1b6.11548842', 'owner', NOW());

-- Тестовые проекты
INSERT INTO projects (id, name, description, color, user_id, team_id, created_at) VALUES
('project_1', 'Main Website', 'Основной сайт компании', '#3B82F6', 'user_68c415fd5a64e6.76941491', 'team_dev_123', NOW()),
('project_2', 'Mobile App', 'Мобильное приложение', '#10B981', 'demo-user-0000-0000-0000-000000000001', 'team_dev_123', NOW()),
('project_3', 'Marketing Campaign', 'Маркетинговая кампания', '#F59E0B', 'demo-user-0000-0000-0000-000000000001', 'team_68c3020149e1b6.11548842', NOW());

-- Тестовые задачи
INSERT INTO tasks (id, title, description, status, priority, due_date, user_id, project_id, team_id, created_at) VALUES
('task_1', 'Создать дизайн главной страницы', 'Разработать современный дизайн для главной страницы сайта', 'completed', 'high', DATE_ADD(NOW(), INTERVAL 7 DAY), 'user_68c415fd5a64e6.76941491', 'project_1', 'team_dev_123', NOW()),
('task_2', 'Настроить API', 'Настроить REST API для мобильного приложения', 'in_progress', 'medium', DATE_ADD(NOW(), INTERVAL 14 DAY), 'demo-user-0000-0000-0000-000000000001', 'project_2', 'team_dev_123', NOW()),
('task_3', 'Создать логотип', 'Разработать новый логотип для компании', 'pending', 'low', DATE_ADD(NOW(), INTERVAL 21 DAY), 'user_68c3020149e1b6.11548842', 'project_3', 'team_68c3020149e1b6.11548842', NOW()),
('task_4', 'Оптимизировать производительность', 'Улучшить скорость загрузки сайта', 'pending', 'high', DATE_ADD(NOW(), INTERVAL 10 DAY), 'user_68c415fd5a64e6.76941491', 'project_1', 'team_dev_123', NOW()),
('task_5', 'Написать документацию', 'Создать техническую документацию для API', 'pending', 'medium', DATE_ADD(NOW(), INTERVAL 30 DAY), 'demo-user-0000-0000-0000-000000000001', 'project_2', 'team_dev_123', NOW());

-- Тестовые комментарии к задачам
INSERT INTO task_comments (id, task_id, user_id, content, created_at) VALUES
('comment_1', 'task_1', 'user_68c415fd5a64e6.76941491', 'Отличная работа! Дизайн получился очень современным.', NOW()),
('comment_2', 'task_1', 'demo-user-0000-0000-0000-000000000001', 'Согласен, очень красиво получилось.', NOW()),
('comment_3', 'task_2', 'demo-user-0000-0000-0000-000000000001', 'API почти готов, осталось добавить аутентификацию.', NOW());

-- Тестовая активность команд
INSERT INTO team_collaboration (id, team_id, user_id, activity_type, activity_data, target_id, target_type, created_at) VALUES
('collab_1', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'task_created', '{"task_title": "Создать дизайн главной страницы"}', 'task_1', 'task', NOW()),
('collab_2', 'team_dev_123', 'demo-user-0000-0000-0000-000000000001', 'task_updated', '{"task_title": "Настроить API", "status": "in_progress"}', 'task_2', 'task', NOW()),
('collab_3', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'comment_added', '{"task_title": "Создать дизайн главной страницы"}', 'task_1', 'task', NOW()),
('collab_4', 'team_dev_123', 'demo-user-0000-0000-0000-000000000001', 'project_created', '{"project_title": "Mobile App"}', 'project_2', 'project', NOW());

-- Тестовые файлы команд
INSERT INTO team_files (id, team_id, user_id, task_id, project_id, filename, original_filename, file_path, file_size, mime_type, created_at) VALUES
('file_1', 'team_dev_123', 'user_68c415fd5a64e6.76941491', NULL, 'project_1', 'design_mockup.png', 'design_mockup.png', '/uploads/team_files/design_mockup.png', 1024000, 'image/png', NOW()),
('file_2', 'team_dev_123', 'user_68c415fd5a64e6.76941491', NULL, 'project_1', 'api_documentation.pdf', 'API Documentation.pdf', '/uploads/team_files/api_documentation.pdf', 2048000, 'application/pdf', NOW()),
('file_3', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'task_1', NULL, 'wireframe.fig', 'Wireframe.fig', '/uploads/team_files/wireframe.fig', 512000, 'application/octet-stream', NOW());

-- Тестовые сообщения чата
INSERT INTO team_chat_messages (id, team_id, user_id, message, message_type, created_at) VALUES
('msg_1', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'Привет команда! Как дела с проектом?', 'text', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('msg_2', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'Я закончил работу над дизайном главной страницы', 'text', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('msg_3', 'team_dev_123', 'demo-user-0000-0000-0000-000000000001', 'Отлично! Можем переходить к следующему этапу', 'text', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('msg_4', 'team_dev_123', 'user_68c3020149e1b6.11548842', 'Когда планируем релиз?', 'text', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('msg_5', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'Думаю, через неделю сможем запустить бета-версию', 'text', DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Тестовые уведомления
INSERT INTO team_notifications (id, team_id, user_id, type, title, message, data, is_read, created_at) VALUES
('notif_1', 'team_dev_123', 'demo-user-0000-0000-0000-000000000001', 'task_assigned', 'Новая задача', 'Вам назначена новая задача: "Оптимизировать производительность"', '{"task_id": "task_4"}', FALSE, NOW()),
('notif_2', 'team_dev_123', 'user_68c3020149e1b6.11548842', 'comment_added', 'Новый комментарий', 'Добавлен комментарий к задаче "Создать дизайн главной страницы"', '{"task_id": "task_1", "comment_id": "comment_1"}', FALSE, NOW()),
('notif_3', 'team_dev_123', 'user_68c415fd5a64e6.76941491', 'file_uploaded', 'Загружен файл', 'Загружен новый файл: "design_mockup.png"', '{"file_id": "file_1"}', TRUE, NOW());


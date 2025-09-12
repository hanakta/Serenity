-- SQL скрипт для импорта в MySQL/PHPMyAdmin
-- Создайте базу данных: CREATE DATABASE serenity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Используйте базу данных: USE serenity_db;

-- Создание таблиц
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    due_date TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вставка данных
INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) VALUES ('demo-user-0000-0000-0000-000000000001', 'Demo User', 'demo@serenity.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'http://localhost:8000/uploads/avatars/68c2a481e267a_1757586561.jpg', 'user', '2025-09-09 17:45:38', '2025-09-11 10:29:21');
INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) VALUES ('user_68c067ea4528e0.04565108', 'Тестовый пользователь', 'test@example.com', '$2y$12$tgsgSeW8dSFL7L4x/a4fderAeLU3zRi8S/fjfekqKvFT.sk/UrjAO', NULL, 'user', '2025-09-09 17:46:18', '2025-09-09 17:46:18');
INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) VALUES ('user_68c2a3faa1d194.91343850', 'New User', 'newuser@example.com', '$2y$12$6x8eMIN2Gl05FZq.P0CtNenQMPTwdtg6UJ5d84JeqxWx2AiZb4gFK', NULL, 'user', '2025-09-11 10:27:06', '2025-09-11 10:27:06');
INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) VALUES ('user_68c2eedd19dc10.69584464', 'Test User', 'test@test.com', '$2y$12$nlzvnvu09cHXpQ5PuJHjiur6qsAjdXHwRp7t6/iIOqjuhpzYsGMnW', NULL, 'user', '2025-09-11 15:46:37', '2025-09-11 15:46:37');
INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) VALUES ('user_68c2ff9f1e0ff2.25818836', 'nurisk', 'nurislammyrzat@gmail.com', '$2y$12$PWtYLWDthwybs93gmjodEOL4UBTISU2vYqJslizJmjr9.zzE7ZAmy', NULL, 'user', '2025-09-11 16:58:07', '2025-09-11 16:58:07');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_dev_123', 'Команда разработки', 'Основная команда разработчиков проекта Serenity', '#3B82F6', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:10:39', '2025-09-11 16:10:39');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_design_123', 'Команда дизайна', 'UI/UX дизайнеры и маркетологи', '#8B5CF6', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:10:39', '2025-09-11 16:10:39');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f4b4cdb685.93273055', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:11:32', '2025-09-11 16:11:32');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f4c2160e42.15624636', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:11:46', '2025-09-11 16:11:46');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f4ce9dc1a5.33200624', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:11:58', '2025-09-11 16:11:58');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f4e4298693.24421728', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:12:20', '2025-09-11 16:12:20');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f52552cd91.53072916', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:13:25', '2025-09-11 16:13:25');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f54f2e7d63.33020986', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:14:07', '2025-09-11 16:14:07');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f5970c5b28.43945736', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:15:19', '2025-09-11 16:15:19');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f5a7c1a221.23065281', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:15:35', '2025-09-11 16:15:35');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f69778bb91.81641119', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:19:35', '2025-09-11 16:19:35');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f6a2b49851.32426661', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:19:46', '2025-09-11 16:19:46');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f6c7018749.30888168', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:20:23', '2025-09-11 16:20:23');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2f6daf216e9.49132542', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:20:42', '2025-09-11 16:20:42');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2fc6bab9398.82086369', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:44:27', '2025-09-11 16:44:27');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2fc6bad6c69.27004613', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:44:27', '2025-09-11 16:44:27');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2fc7c852004.34896874', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:44:44', '2025-09-11 16:44:44');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c2fc7c85d961.31973811', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 16:44:44', '2025-09-11 16:44:44');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c300b59603e0.81705016', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:02:45', '2025-09-11 17:02:45');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c300b5978936.45861890', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:02:45', '2025-09-11 17:02:45');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c300d2562370.93603173', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:03:14', '2025-09-11 17:03:14');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c300d2570d28.83819294', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:03:14', '2025-09-11 17:03:14');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c3015ece6c48.74591266', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:05:34', '2025-09-11 17:05:34');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c3015ecf4072.78337514', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:05:34', '2025-09-11 17:05:34');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c3018522ca66.96079650', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:06:13', '2025-09-11 17:06:13');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c3018523a111.76559521', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:06:13', '2025-09-11 17:06:13');
INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ('team_68c3020149e1b6.11548842', 'Тестовая команда', 'Команда для тестирования', '#FF6B6B', 'demo-user-0000-0000-0000-000000000001', '2025-09-11 17:08:17', '2025-09-11 17:08:17');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('member_1_123', 'team_dev_123', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:10:39');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('member_2_123', 'team_design_123', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:10:39');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f4b4ce4121.06926230', 'team_68c2f4b4cdb685.93273055', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:11:32');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f4c21677a1.58835744', 'team_68c2f4c2160e42.15624636', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:11:46');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f4ce9e31c8.97690087', 'team_68c2f4ce9dc1a5.33200624', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:11:58');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f4e429bb64.31219437', 'team_68c2f4e4298693.24421728', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:12:20');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f525539806.44160805', 'team_68c2f52552cd91.53072916', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:13:25');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f54f2f1e43.06408305', 'team_68c2f54f2e7d63.33020986', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:14:07');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f5970ce335.18778670', 'team_68c2f5970c5b28.43945736', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:15:19');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f5a7c21681.39604313', 'team_68c2f5a7c1a221.23065281', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:15:35');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f6977993a1.41685512', 'team_68c2f69778bb91.81641119', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:19:35');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f6a2b50172.36751720', 'team_68c2f6a2b49851.32426661', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:19:46');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f6c70214c4.56546587', 'team_68c2f6c7018749.30888168', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:20:23');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2f6daf2a119.49449500', 'team_68c2f6daf216e9.49132542', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:20:42');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2fc6bacc3e8.40789110', 'team_68c2fc6bab9398.82086369', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:44:27');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2fc6bad9593.96106053', 'team_68c2fc6bad6c69.27004613', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:44:27');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2fc7c85afb2.69436105', 'team_68c2fc7c852004.34896874', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:44:44');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c2fc7c85eec5.37479619', 'team_68c2fc7c85d961.31973811', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 16:44:44');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c300b59719c5.05681713', 'team_68c300b59603e0.81705016', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:02:45');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c300b597a850.12577808', 'team_68c300b5978936.45861890', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:02:45');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c300d256c9b0.71927404', 'team_68c300d2562370.93603173', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:03:14');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c300d2572188.40505880', 'team_68c300d2570d28.83819294', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:03:14');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c3015ecf1248.36349223', 'team_68c3015ece6c48.74591266', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:05:34');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c3015ecf56d7.78033521', 'team_68c3015ecf4072.78337514', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:05:34');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c30185236583.55206327', 'team_68c3018522ca66.96079650', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:06:13');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c3018523bf36.19674265', 'team_68c3018523a111.76559521', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:06:13');
INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ('team_68c302014a9413.81106557', 'team_68c3020149e1b6.11548842', 'demo-user-0000-0000-0000-000000000001', 'owner', '2025-09-11 17:08:17');
INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) VALUES ('demo-task-0000-0000-0000-000000000001', 'Изучить новый фреймворк', 'Потратить 2 часа на изучение документации', 'todo', 'high', 'demo-user-0000-0000-0000-000000000001', NULL, NULL, NULL, '2025-09-09 17:45:38', '2025-09-09 17:45:38');
INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) VALUES ('demo-task-0000-0000-0000-000000000002', 'Купить продукты', 'Молоко, хлеб, яйца', 'todo', 'medium', 'demo-user-0000-0000-0000-000000000001', NULL, NULL, NULL, '2025-09-09 17:45:38', '2025-09-09 17:45:38');
INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) VALUES ('demo-task-0000-0000-0000-000000000003', 'Записаться к врачу', 'Проверить здоровье', 'completed', 'high', 'demo-user-0000-0000-0000-000000000001', NULL, NULL, NULL, '2025-09-09 17:45:38', '2025-09-09 17:45:38');
INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) VALUES ('task_68c0681f2f9537.30848980', 'Изучить PHP', 'Потратить 2 часа на изучение', 'todo', 'high', 'user_68c067ea4528e0.04565108', NULL, '2025-12-31 18:00:00', NULL, '2025-09-09 17:47:11', '2025-09-09 17:47:11');
INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) VALUES ('task_68c2b9ec9010d9.29189262', 'as', 'as', 'completed', 'medium', 'demo-user-0000-0000-0000-000000000001', NULL, '2025-09-12T11:11', '2025-09-11 13:57:20', '2025-09-11 12:00:44', '2025-09-11 13:57:20');
INSERT INTO projects (id, name, description, user_id, team_id, created_at, updated_at) VALUES ('demo-project-0000-0000-0000-000000000001', 'Личные задачи', 'Мои личные задачи и планы', 'demo-user-0000-0000-0000-000000000001', NULL, '2025-09-09 17:45:38', '2025-09-09 17:45:38');
INSERT INTO projects (id, name, description, user_id, team_id, created_at, updated_at) VALUES ('demo-project-0000-0000-0000-000000000002', 'Работа', 'Рабочие проекты и задачи', 'demo-user-0000-0000-0000-000000000001', NULL, '2025-09-09 17:45:38', '2025-09-09 17:45:38');

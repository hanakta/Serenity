<?php
// 📤 Экспорт данных из SQLite в JSON для импорта в PHPMyAdmin

require_once 'vendor/autoload.php';

echo "=== ЭКСПОРТ ДАННЫХ В JSON ДЛЯ PHPMyAdmin ===\n\n";

try {
    // Подключаемся к SQLite
    $sqliteConfig = require 'config/database.php';
    $sqliteDb = new PDO(
        "sqlite:" . $sqliteConfig['database'],
        null,
        null,
        $sqliteConfig['options']
    );
    
    echo "✅ Подключение к SQLite установлено\n";
    
    // Создаем папку для экспорта
    if (!is_dir('export')) {
        mkdir('export', 0755, true);
    }
    
    // Экспортируем пользователей
    echo "👥 Экспортируем пользователей...\n";
    $users = $sqliteDb->query("SELECT * FROM users")->fetchAll();
    file_put_contents('export/users.json', json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Пользователи экспортированы: " . count($users) . " записей\n";
    
    // Экспортируем команды
    echo "👥 Экспортируем команды...\n";
    $teams = $sqliteDb->query("SELECT * FROM teams")->fetchAll();
    file_put_contents('export/teams.json', json_encode($teams, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Команды экспортированы: " . count($teams) . " записей\n";
    
    // Экспортируем участников команд
    echo "👥 Экспортируем участников команд...\n";
    $members = $sqliteDb->query("SELECT * FROM team_members")->fetchAll();
    file_put_contents('export/team_members.json', json_encode($members, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Участники команд экспортированы: " . count($members) . " записей\n";
    
    // Экспортируем задачи
    echo "📋 Экспортируем задачи...\n";
    $tasks = $sqliteDb->query("SELECT * FROM tasks")->fetchAll();
    file_put_contents('export/tasks.json', json_encode($tasks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Задачи экспортированы: " . count($tasks) . " записей\n";
    
    // Экспортируем проекты
    echo "📁 Экспортируем проекты...\n";
    $projects = $sqliteDb->query("SELECT * FROM projects")->fetchAll();
    file_put_contents('export/projects.json', json_encode($projects, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Проекты экспортированы: " . count($projects) . " записей\n";
    
    // Создаем SQL скрипт для импорта в MySQL
    echo "📝 Создаем SQL скрипт для импорта...\n";
    
    $sqlScript = "-- SQL скрипт для импорта в MySQL/PHPMyAdmin\n";
    $sqlScript .= "-- Создайте базу данных: CREATE DATABASE serenity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
    $sqlScript .= "-- Используйте базу данных: USE serenity_db;\n\n";
    
    // Добавляем CREATE TABLE statements
    $sqlScript .= "-- Создание таблиц\n";
    $sqlScript .= "CREATE TABLE IF NOT EXISTS users (\n";
    $sqlScript .= "    id VARCHAR(36) PRIMARY KEY,\n";
    $sqlScript .= "    name VARCHAR(255) NOT NULL,\n";
    $sqlScript .= "    email VARCHAR(255) UNIQUE NOT NULL,\n";
    $sqlScript .= "    password_hash VARCHAR(255) NOT NULL,\n";
    $sqlScript .= "    avatar VARCHAR(255),\n";
    $sqlScript .= "    role ENUM('user', 'admin') DEFAULT 'user',\n";
    $sqlScript .= "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n";
    $sqlScript .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";
    
    $sqlScript .= "CREATE TABLE IF NOT EXISTS teams (\n";
    $sqlScript .= "    id VARCHAR(36) PRIMARY KEY,\n";
    $sqlScript .= "    name VARCHAR(255) NOT NULL,\n";
    $sqlScript .= "    description TEXT,\n";
    $sqlScript .= "    color VARCHAR(7) DEFAULT '#3B82F6',\n";
    $sqlScript .= "    owner_id VARCHAR(36) NOT NULL,\n";
    $sqlScript .= "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE\n";
    $sqlScript .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";
    
    $sqlScript .= "CREATE TABLE IF NOT EXISTS team_members (\n";
    $sqlScript .= "    id VARCHAR(36) PRIMARY KEY,\n";
    $sqlScript .= "    team_id VARCHAR(36) NOT NULL,\n";
    $sqlScript .= "    user_id VARCHAR(36) NOT NULL,\n";
    $sqlScript .= "    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',\n";
    $sqlScript .= "    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,\n";
    $sqlScript .= "    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n";
    $sqlScript .= "    UNIQUE KEY unique_team_user (team_id, user_id)\n";
    $sqlScript .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";
    
    $sqlScript .= "CREATE TABLE IF NOT EXISTS tasks (\n";
    $sqlScript .= "    id VARCHAR(36) PRIMARY KEY,\n";
    $sqlScript .= "    title VARCHAR(255) NOT NULL,\n";
    $sqlScript .= "    description TEXT,\n";
    $sqlScript .= "    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',\n";
    $sqlScript .= "    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',\n";
    $sqlScript .= "    user_id VARCHAR(36) NOT NULL,\n";
    $sqlScript .= "    team_id VARCHAR(36),\n";
    $sqlScript .= "    due_date TIMESTAMP NULL,\n";
    $sqlScript .= "    completed_at TIMESTAMP NULL,\n";
    $sqlScript .= "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n";
    $sqlScript .= "    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL\n";
    $sqlScript .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";
    
    $sqlScript .= "CREATE TABLE IF NOT EXISTS projects (\n";
    $sqlScript .= "    id VARCHAR(36) PRIMARY KEY,\n";
    $sqlScript .= "    name VARCHAR(255) NOT NULL,\n";
    $sqlScript .= "    description TEXT,\n";
    $sqlScript .= "    user_id VARCHAR(36) NOT NULL,\n";
    $sqlScript .= "    team_id VARCHAR(36),\n";
    $sqlScript .= "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n";
    $sqlScript .= "    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n";
    $sqlScript .= "    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL\n";
    $sqlScript .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";
    
    // Добавляем INSERT statements для данных
    $sqlScript .= "-- Вставка данных\n";
    
    foreach ($users as $user) {
        $sqlScript .= "INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) VALUES ";
        $sqlScript .= "('" . addslashes($user['id']) . "', ";
        $sqlScript .= "'" . addslashes($user['name']) . "', ";
        $sqlScript .= "'" . addslashes($user['email']) . "', ";
        $sqlScript .= "'" . addslashes($user['password_hash']) . "', ";
        $sqlScript .= ($user['avatar'] ? "'" . addslashes($user['avatar']) . "'" : 'NULL') . ", ";
        $sqlScript .= "'" . addslashes($user['role'] ?? 'user') . "', ";
        $sqlScript .= "'" . addslashes($user['created_at']) . "', ";
        $sqlScript .= "'" . addslashes($user['updated_at']) . "');\n";
    }
    
    foreach ($teams as $team) {
        $sqlScript .= "INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) VALUES ";
        $sqlScript .= "('" . addslashes($team['id']) . "', ";
        $sqlScript .= "'" . addslashes($team['name']) . "', ";
        $sqlScript .= ($team['description'] ? "'" . addslashes($team['description']) . "'" : 'NULL') . ", ";
        $sqlScript .= "'" . addslashes($team['color'] ?? '#3B82F6') . "', ";
        $sqlScript .= "'" . addslashes($team['owner_id']) . "', ";
        $sqlScript .= "'" . addslashes($team['created_at']) . "', ";
        $sqlScript .= "'" . addslashes($team['updated_at']) . "');\n";
    }
    
    foreach ($members as $member) {
        $sqlScript .= "INSERT INTO team_members (id, team_id, user_id, role, joined_at) VALUES ";
        $sqlScript .= "('" . addslashes($member['id']) . "', ";
        $sqlScript .= "'" . addslashes($member['team_id']) . "', ";
        $sqlScript .= "'" . addslashes($member['user_id']) . "', ";
        $sqlScript .= "'" . addslashes($member['role'] ?? 'member') . "', ";
        $sqlScript .= "'" . addslashes($member['joined_at']) . "');\n";
    }
    
    foreach ($tasks as $task) {
        $sqlScript .= "INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) VALUES ";
        $sqlScript .= "('" . addslashes($task['id']) . "', ";
        $sqlScript .= "'" . addslashes($task['title']) . "', ";
        $sqlScript .= ($task['description'] ? "'" . addslashes($task['description']) . "'" : 'NULL') . ", ";
        $sqlScript .= "'" . addslashes($task['status'] ?? 'todo') . "', ";
        $sqlScript .= "'" . addslashes($task['priority'] ?? 'medium') . "', ";
        $sqlScript .= "'" . addslashes($task['user_id']) . "', ";
        $sqlScript .= ($task['team_id'] ? "'" . addslashes($task['team_id']) . "'" : 'NULL') . ", ";
        $sqlScript .= ($task['due_date'] ? "'" . addslashes($task['due_date']) . "'" : 'NULL') . ", ";
        $sqlScript .= ($task['completed_at'] ? "'" . addslashes($task['completed_at']) . "'" : 'NULL') . ", ";
        $sqlScript .= "'" . addslashes($task['created_at']) . "', ";
        $sqlScript .= "'" . addslashes($task['updated_at']) . "');\n";
    }
    
    foreach ($projects as $project) {
        $sqlScript .= "INSERT INTO projects (id, name, description, user_id, team_id, created_at, updated_at) VALUES ";
        $sqlScript .= "('" . addslashes($project['id']) . "', ";
        $sqlScript .= "'" . addslashes($project['name']) . "', ";
        $sqlScript .= ($project['description'] ? "'" . addslashes($project['description']) . "'" : 'NULL') . ", ";
        $sqlScript .= "'" . addslashes($project['user_id']) . "', ";
        $sqlScript .= ($project['team_id'] ? "'" . addslashes($project['team_id']) . "'" : 'NULL') . ", ";
        $sqlScript .= "'" . addslashes($project['created_at']) . "', ";
        $sqlScript .= "'" . addslashes($project['updated_at']) . "');\n";
    }
    
    file_put_contents('export/import_to_mysql.sql', $sqlScript);
    echo "✅ SQL скрипт создан\n\n";
    
    // Создаем README с инструкциями
    $readme = "# 📤 Экспорт данных для PHPMyAdmin\n\n";
    $readme .= "## 📁 Файлы экспорта:\n";
    $readme .= "- `users.json` - пользователи (" . count($users) . " записей)\n";
    $readme .= "- `teams.json` - команды (" . count($teams) . " записей)\n";
    $readme .= "- `team_members.json` - участники команд (" . count($members) . " записей)\n";
    $readme .= "- `tasks.json` - задачи (" . count($tasks) . " записей)\n";
    $readme .= "- `projects.json` - проекты (" . count($projects) . " записей)\n";
    $readme .= "- `import_to_mysql.sql` - SQL скрипт для импорта\n\n";
    $readme .= "## 🚀 Как импортировать в PHPMyAdmin:\n\n";
    $readme .= "1. **Откройте PHPMyAdmin** (http://localhost/phpmyadmin)\n";
    $readme .= "2. **Создайте базу данных** `serenity_db`\n";
    $readme .= "3. **Выберите базу данных** `serenity_db`\n";
    $readme .= "4. **Перейдите на вкладку** \"SQL\"\n";
    $readme .= "5. **Скопируйте и вставьте** содержимое файла `import_to_mysql.sql`\n";
    $readme .= "6. **Нажмите** \"Выполнить\"\n\n";
    $readme .= "## 📊 Статистика данных:\n";
    $readme .= "- 👥 Пользователи: " . count($users) . "\n";
    $readme .= "- 👥 Команды: " . count($teams) . "\n";
    $readme .= "- 👥 Участники: " . count($members) . "\n";
    $readme .= "- 📋 Задачи: " . count($tasks) . "\n";
    $readme .= "- 📁 Проекты: " . count($projects) . "\n\n";
    $readme .= "## 🔄 Альтернативный способ:\n";
    $readme .= "Вы также можете использовать JSON файлы для импорта через PHP скрипт или другие инструменты.\n";
    
    file_put_contents('export/README.md', $readme);
    echo "✅ README создан\n\n";
    
    echo "🎉 ЭКСПОРТ ЗАВЕРШЕН УСПЕШНО!\n\n";
    echo "📁 Файлы созданы в папке: export/\n";
    echo "   📄 users.json\n";
    echo "   📄 teams.json\n";
    echo "   📄 team_members.json\n";
    echo "   📄 tasks.json\n";
    echo "   📄 projects.json\n";
    echo "   📄 import_to_mysql.sql\n";
    echo "   📄 README.md\n\n";
    
    echo "🔗 Для импорта в PHPMyAdmin:\n";
    echo "   1. Откройте http://localhost/phpmyadmin\n";
    echo "   2. Создайте базу данных 'serenity_db'\n";
    echo "   3. Выберите базу данных\n";
    echo "   4. Перейдите на вкладку 'SQL'\n";
    echo "   5. Скопируйте содержимое файла 'import_to_mysql.sql'\n";
    echo "   6. Нажмите 'Выполнить'\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка экспорта: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


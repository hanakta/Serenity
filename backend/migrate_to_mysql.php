<?php
// 🚀 Миграция данных из localStorage в MySQL

require_once 'vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Database\Database;

echo "=== МИГРАЦИЯ ДАННЫХ В MYSQL ===\n\n";

try {
    // Подключаемся к SQLite (источник)
    $sqliteConfig = require 'config/database.php';
    $sqliteDb = new PDO(
        "sqlite:" . $sqliteConfig['database'],
        null,
        null,
        $sqliteConfig['options']
    );
    
    echo "✅ Подключение к SQLite установлено\n";
    
    // Подключаемся к MySQL (назначение)
    $mysqlConfig = require 'config/database_mysql.php';
    $mysqlDb = new PDO(
        "mysql:host={$mysqlConfig['host']};port={$mysqlConfig['port']};dbname={$mysqlConfig['database']};charset={$mysqlConfig['charset']}",
        $mysqlConfig['username'],
        $mysqlConfig['password'],
        $mysqlConfig['options']
    );
    
    echo "✅ Подключение к MySQL установлено\n\n";
    
    // Создаем таблицы в MySQL
    echo "📋 Создаем таблицы в MySQL...\n";
    
    $createTablesSQL = "
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        owner_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(36) PRIMARY KEY,
        team_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_team_user (team_id, user_id)
    );
    
    CREATE TABLE IF NOT EXISTS team_invitations (
        id VARCHAR(36) PRIMARY KEY,
        team_id VARCHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
        status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
        invited_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
    );
    
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
    );
    
    CREATE TABLE IF NOT EXISTS task_comments (
        id VARCHAR(36) PRIMARY KEY,
        task_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
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
    );
    
    CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        team_id VARCHAR(36),
        action VARCHAR(100) NOT NULL,
        description TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
    );
    ";
    
    $mysqlDb->exec($createTablesSQL);
    echo "✅ Таблицы созданы\n\n";
    
    // Мигрируем пользователей
    echo "👥 Мигрируем пользователей...\n";
    $users = $sqliteDb->query("SELECT * FROM users")->fetchAll();
    foreach ($users as $user) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO users (id, name, email, password_hash, avatar, role, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            email = VALUES(email), 
            password_hash = VALUES(password_hash),
            avatar = VALUES(avatar),
            role = VALUES(role),
            updated_at = VALUES(updated_at)
        ");
        $stmt->execute([
            $user['id'],
            $user['name'],
            $user['email'],
            $user['password_hash'],
            $user['avatar'] ?? null,
            $user['role'] ?? 'user',
            $user['created_at'],
            $user['updated_at']
        ]);
    }
    echo "✅ Пользователи мигрированы: " . count($users) . " записей\n";
    
    // Мигрируем команды
    echo "👥 Мигрируем команды...\n";
    $teams = $sqliteDb->query("SELECT * FROM teams")->fetchAll();
    foreach ($teams as $team) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            description = VALUES(description), 
            color = VALUES(color),
            owner_id = VALUES(owner_id),
            updated_at = VALUES(updated_at)
        ");
        $stmt->execute([
            $team['id'],
            $team['name'],
            $team['description'] ?? null,
            $team['color'] ?? '#3B82F6',
            $team['owner_id'],
            $team['created_at'],
            $team['updated_at']
        ]);
    }
    echo "✅ Команды мигрированы: " . count($teams) . " записей\n";
    
    // Мигрируем участников команд
    echo "👥 Мигрируем участников команд...\n";
    $members = $sqliteDb->query("SELECT * FROM team_members")->fetchAll();
    foreach ($members as $member) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO team_members (id, team_id, user_id, role, joined_at) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            role = VALUES(role)
        ");
        $stmt->execute([
            $member['id'],
            $member['team_id'],
            $member['user_id'],
            $member['role'] ?? 'member',
            $member['joined_at']
        ]);
    }
    echo "✅ Участники команд мигрированы: " . count($members) . " записей\n";
    
    // Мигрируем задачи
    echo "📋 Мигрируем задачи...\n";
    $tasks = $sqliteDb->query("SELECT * FROM tasks")->fetchAll();
    foreach ($tasks as $task) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, completed_at, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            title = VALUES(title), 
            description = VALUES(description), 
            status = VALUES(status),
            priority = VALUES(priority),
            due_date = VALUES(due_date),
            completed_at = VALUES(completed_at),
            updated_at = VALUES(updated_at)
        ");
        $stmt->execute([
            $task['id'],
            $task['title'],
            $task['description'] ?? null,
            $task['status'] ?? 'todo',
            $task['priority'] ?? 'medium',
            $task['user_id'],
            $task['team_id'] ?? null,
            $task['due_date'] ?? null,
            $task['completed_at'] ?? null,
            $task['created_at'],
            $task['updated_at']
        ]);
    }
    echo "✅ Задачи мигрированы: " . count($tasks) . " записей\n";
    
    // Мигрируем проекты
    echo "📁 Мигрируем проекты...\n";
    $projects = $sqliteDb->query("SELECT * FROM projects")->fetchAll();
    foreach ($projects as $project) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO projects (id, name, description, user_id, team_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            description = VALUES(description), 
            team_id = VALUES(team_id),
            updated_at = VALUES(updated_at)
        ");
        $stmt->execute([
            $project['id'],
            $project['name'],
            $project['description'] ?? null,
            $project['user_id'],
            $project['team_id'] ?? null,
            $project['created_at'],
            $project['updated_at']
        ]);
    }
    echo "✅ Проекты мигрированы: " . count($projects) . " записей\n";
    
    echo "\n🎉 МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!\n";
    echo "📊 Статистика:\n";
    echo "   👥 Пользователи: " . count($users) . "\n";
    echo "   👥 Команды: " . count($teams) . "\n";
    echo "   👥 Участники: " . count($members) . "\n";
    echo "   📋 Задачи: " . count($tasks) . "\n";
    echo "   📁 Проекты: " . count($projects) . "\n";
    
    echo "\n🔗 Теперь вы можете подключиться к PHPMyAdmin:\n";
    echo "   URL: http://localhost/phpmyadmin\n";
    echo "   База данных: serenity_db\n";
    echo "   Пользователь: root\n";
    echo "   Пароль: (пустой)\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка миграции: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


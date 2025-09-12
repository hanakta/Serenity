<?php
// 🔄 Обновление существующей базы данных serenity в PHPMyAdmin

require_once 'vendor/autoload.php';

echo "=== ОБНОВЛЕНИЕ СУЩЕСТВУЮЩЕЙ БАЗЫ ДАННЫХ SERENITY ===\n\n";

try {
    // Подключаемся к существующей базе данных serenity
    $mysqlDb = new PDO(
        "mysql:host=localhost;port=8889;dbname=serenity;charset=utf8mb4",
        'root',
        'root',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    
    echo "✅ Подключение к существующей базе 'serenity' установлено\n";
    
    // Проверяем существующие таблицы
    echo "📋 Проверяем существующие таблицы...\n";
    $existingTables = $mysqlDb->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Найдено таблиц: " . count($existingTables) . "\n";
    foreach ($existingTables as $table) {
        echo "  - $table\n";
    }
    echo "\n";
    
    // Создаем недостающие таблицы для команд
    echo "👥 Создаем таблицы для команд...\n";
    
    $createTeamsTable = "
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
    ";
    
    $createTeamMembersTable = "
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
    ";
    
    $createTeamInvitationsTable = "
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $createTaskCommentsTable = "
    CREATE TABLE IF NOT EXISTS task_comments (
        id VARCHAR(36) PRIMARY KEY,
        task_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $createActivityLogsTable = "
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    // Выполняем создание таблиц
    $mysqlDb->exec($createTeamsTable);
    echo "✅ Таблица 'teams' создана/обновлена\n";
    
    $mysqlDb->exec($createTeamMembersTable);
    echo "✅ Таблица 'team_members' создана/обновлена\n";
    
    $mysqlDb->exec($createTeamInvitationsTable);
    echo "✅ Таблица 'team_invitations' создана/обновлена\n";
    
    $mysqlDb->exec($createTaskCommentsTable);
    echo "✅ Таблица 'task_comments' создана/обновлена\n";
    
    $mysqlDb->exec($createActivityLogsTable);
    echo "✅ Таблица 'activity_logs' создана/обновлена\n";
    
    // Добавляем колонку team_id к существующей таблице tasks, если её нет
    echo "\n🔧 Обновляем существующую таблицу 'tasks'...\n";
    try {
        $mysqlDb->exec("ALTER TABLE tasks ADD COLUMN team_id VARCHAR(36) NULL");
        $mysqlDb->exec("ALTER TABLE tasks ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL");
        echo "✅ Колонка 'team_id' добавлена к таблице 'tasks'\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "ℹ️  Колонка 'team_id' уже существует в таблице 'tasks'\n";
        } else {
            echo "⚠️  Предупреждение при добавлении колонки: " . $e->getMessage() . "\n";
        }
    }
    
    // Добавляем колонку team_id к существующей таблице projects, если её нет
    try {
        $mysqlDb->exec("ALTER TABLE projects ADD COLUMN team_id VARCHAR(36) NULL");
        $mysqlDb->exec("ALTER TABLE projects ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL");
        echo "✅ Колонка 'team_id' добавлена к таблице 'projects'\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "ℹ️  Колонка 'team_id' уже существует в таблице 'projects'\n";
        } else {
            echo "⚠️  Предупреждение при добавлении колонки: " . $e->getMessage() . "\n";
        }
    }
    
    // Импортируем данные из SQLite
    echo "\n📥 Импортируем данные из SQLite...\n";
    
    // Подключаемся к SQLite
    $sqliteConfig = require 'config/database.php';
    $sqliteDb = new PDO(
        "sqlite:" . $sqliteConfig['database'],
        null,
        null,
        $sqliteConfig['options']
    );
    
    // Импортируем команды
    $teams = $sqliteDb->query("SELECT * FROM teams")->fetchAll();
    echo "👥 Импортируем команды: " . count($teams) . " записей\n";
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
    
    // Импортируем участников команд
    $members = $sqliteDb->query("SELECT * FROM team_members")->fetchAll();
    echo "👥 Импортируем участников команд: " . count($members) . " записей\n";
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
    
    // Обновляем существующие задачи с team_id
    echo "📋 Обновляем существующие задачи...\n";
    $tasks = $sqliteDb->query("SELECT * FROM tasks WHERE team_id IS NOT NULL")->fetchAll();
    foreach ($tasks as $task) {
        $stmt = $mysqlDb->prepare("
            UPDATE tasks 
            SET team_id = ? 
            WHERE id = ?
        ");
        $stmt->execute([$task['team_id'], $task['id']]);
    }
    echo "✅ Обновлено задач: " . count($tasks) . "\n";
    
    // Создаем индексы для производительности
    echo "\n⚡ Создаем индексы...\n";
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams (owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members (team_id)",
        "CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members (user_id)",
        "CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks (team_id)",
        "CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects (team_id)",
        "CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id)",
        "CREATE INDEX IF NOT EXISTS idx_activity_logs_team_id ON activity_logs (team_id)"
    ];
    
    foreach ($indexes as $index) {
        try {
            $mysqlDb->exec($index);
        } catch (Exception $e) {
            // Игнорируем ошибки если индекс уже существует
        }
    }
    echo "✅ Индексы созданы\n";
    
    // Показываем финальную статистику
    echo "\n📊 ФИНАЛЬНАЯ СТАТИСТИКА БАЗЫ ДАННЫХ:\n";
    $tables = ['users', 'teams', 'team_members', 'team_invitations', 'tasks', 'projects', 'task_comments', 'activity_logs', 'notifications', 'tags', 'task_tags'];
    
    foreach ($tables as $table) {
        try {
            $count = $mysqlDb->query("SELECT COUNT(*) as count FROM $table")->fetch()['count'];
            echo "  📋 $table: $count записей\n";
        } catch (Exception $e) {
            echo "  ❌ $table: таблица не найдена\n";
        }
    }
    
    echo "\n🎉 ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ ЗАВЕРШЕНО УСПЕШНО!\n";
    echo "🔗 Теперь вы можете использовать PHPMyAdmin:\n";
    echo "   URL: http://localhost:8889/phpmyadmin\n";
    echo "   База данных: serenity\n";
    echo "   Пользователь: root\n";
    echo "   Пароль: root\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка обновления: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


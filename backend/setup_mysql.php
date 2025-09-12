<?php
// 🗄️ Настройка MySQL для Serenity

echo "=== НАСТРОЙКА MYSQL ДЛЯ SERENITY ===\n\n";

try {
    // Подключаемся к MySQL без выбора базы данных
    $mysqlDb = new PDO(
        "mysql:host=localhost;port=3306;charset=utf8mb4",
        'root',
        '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    
    echo "✅ Подключение к MySQL установлено\n";
    
    // Создаем базу данных
    echo "📁 Создаем базу данных...\n";
    $mysqlDb->exec("CREATE DATABASE IF NOT EXISTS serenity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ База данных 'serenity_db' создана\n";
    
    // Выбираем базу данных
    $mysqlDb->exec("USE serenity_db");
    echo "✅ База данных выбрана\n\n";
    
    // Создаем таблицы
    echo "📋 Создаем таблицы...\n";
    
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
    
    CREATE TABLE IF NOT EXISTS task_comments (
        id VARCHAR(36) PRIMARY KEY,
        task_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    
    CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    
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
    
    $mysqlDb->exec($createTablesSQL);
    echo "✅ Таблицы созданы\n\n";
    
    // Создаем индексы для производительности
    echo "⚡ Создаем индексы...\n";
    $indexesSQL = "
    CREATE INDEX idx_teams_owner_id ON teams (owner_id);
    CREATE INDEX idx_team_members_team_id ON team_members (team_id);
    CREATE INDEX idx_team_members_user_id ON team_members (user_id);
    CREATE INDEX idx_tasks_user_id ON tasks (user_id);
    CREATE INDEX idx_tasks_team_id ON tasks (team_id);
    CREATE INDEX idx_tasks_status ON tasks (status);
    CREATE INDEX idx_tasks_priority ON tasks (priority);
    CREATE INDEX idx_task_comments_task_id ON task_comments (task_id);
    CREATE INDEX idx_task_comments_user_id ON task_comments (user_id);
    CREATE INDEX idx_projects_user_id ON projects (user_id);
    CREATE INDEX idx_projects_team_id ON projects (team_id);
    CREATE INDEX idx_notifications_user_id ON notifications (user_id);
    CREATE INDEX idx_notifications_is_read ON notifications (is_read);
    CREATE INDEX idx_activity_logs_user_id ON activity_logs (user_id);
    CREATE INDEX idx_activity_logs_team_id ON activity_logs (team_id);
    CREATE INDEX idx_activity_logs_action ON activity_logs (action);
    ";
    
    $mysqlDb->exec($indexesSQL);
    echo "✅ Индексы созданы\n\n";
    
    // Добавляем демо данные
    echo "🎯 Добавляем демо данные...\n";
    
    // Создаем демо пользователя
    $demoUserId = 'demo-user-0000-0000-0000-000000000001';
    $stmt = $mysqlDb->prepare("
        INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        email = VALUES(email)
    ");
    $stmt->execute([
        $demoUserId,
        'Демо пользователь',
        'demo@example.com',
        password_hash('password', PASSWORD_DEFAULT),
        'user'
    ]);
    
    // Создаем демо команды
    $demoTeams = [
        [
            'id' => 'team-demo-1',
            'name' => 'Команда разработки',
            'description' => 'Основная команда разработки продукта',
            'color' => '#3B82F6'
        ],
        [
            'id' => 'team-demo-2',
            'name' => 'Маркетинг',
            'description' => 'Команда маркетинга и продвижения',
            'color' => '#10B981'
        ]
    ];
    
    foreach ($demoTeams as $team) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            description = VALUES(description), 
            color = VALUES(color)
        ");
        $stmt->execute([
            $team['id'],
            $team['name'],
            $team['description'],
            $team['color'],
            $demoUserId
        ]);
    }
    
    echo "✅ Демо данные добавлены\n\n";
    
    echo "🎉 НАСТРОЙКА MYSQL ЗАВЕРШЕНА УСПЕШНО!\n\n";
    echo "🔗 Теперь вы можете подключиться к PHPMyAdmin:\n";
    echo "   URL: http://localhost/phpmyadmin\n";
    echo "   База данных: serenity_db\n";
    echo "   Пользователь: root\n";
    echo "   Пароль: (пустой)\n\n";
    
    echo "📋 Созданные таблицы:\n";
    echo "   👥 users - пользователи\n";
    echo "   👥 teams - команды\n";
    echo "   👥 team_members - участники команд\n";
    echo "   👥 team_invitations - приглашения в команды\n";
    echo "   📋 tasks - задачи\n";
    echo "   💬 task_comments - комментарии к задачам\n";
    echo "   📁 projects - проекты\n";
    echo "   🔔 notifications - уведомления\n";
    echo "   📊 activity_logs - логи активности\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка настройки: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


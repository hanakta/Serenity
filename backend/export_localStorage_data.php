<?php
// 📤 Экспорт данных из localStorage в MySQL

require_once 'vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ЭКСПОРТ ДАННЫХ ИЗ LOCALSTORAGE ===\n\n";

// Данные из localStorage (пример)
$localStorageData = [
    'teams' => [
        [
            'id' => 'team-1',
            'name' => 'Команда разработки',
            'description' => 'Основная команда разработки продукта',
            'color' => '#3B82F6',
            'memberCount' => 5,
            'projectCount' => 3,
            'isOwner' => true,
            'createdAt' => '2025-01-11T10:00:00.000Z',
            'updatedAt' => '2025-01-11T10:00:00.000Z'
        ],
        [
            'id' => 'team-2',
            'name' => 'Маркетинг',
            'description' => 'Команда маркетинга и продвижения',
            'color' => '#10B981',
            'memberCount' => 3,
            'projectCount' => 2,
            'isOwner' => false,
            'createdAt' => '2025-01-11T11:00:00.000Z',
            'updatedAt' => '2025-01-11T11:00:00.000Z'
        ]
    ],
    'members' => [
        [
            'id' => 'member-1',
            'teamId' => 'team-1',
            'userId' => 'current-user',
            'name' => 'Вы',
            'email' => 'you@example.com',
            'role' => 'admin',
            'joinedAt' => '2025-01-11T10:00:00.000Z'
        ],
        [
            'id' => 'member-2',
            'teamId' => 'team-1',
            'userId' => 'user-2',
            'name' => 'Анна Петрова',
            'email' => 'anna@example.com',
            'role' => 'member',
            'joinedAt' => '2025-01-11T10:30:00.000Z'
        ]
    ],
    'collaborative_tasks' => [
        [
            'id' => 'task-1',
            'title' => 'Разработать новый функционал',
            'description' => 'Создать систему уведомлений',
            'status' => 'in_progress',
            'priority' => 'high',
            'assignee' => [
                'id' => 'user-2',
                'name' => 'Анна Петрова',
                'avatar' => '/avatars/anna.jpg'
            ],
            'team' => [
                'id' => 'team-1',
                'name' => 'Команда разработки',
                'color' => '#3B82F6'
            ],
            'dueDate' => '2025-01-15T18:00:00.000Z',
            'comments' => 3,
            'createdAt' => '2025-01-11T12:00:00.000Z',
            'createdBy' => 'current-user'
        ]
    ],
    'chat_messages' => [
        'team-1' => [
            [
                'id' => 'msg-1',
                'text' => 'Привет! Как дела с новым функционалом?',
                'sender' => [
                    'id' => 'user-2',
                    'name' => 'Анна Петрова',
                    'avatar' => '/avatars/anna.jpg',
                    'role' => 'member'
                ],
                'timestamp' => '2025-01-11T14:00:00.000Z',
                'type' => 'text',
                'reactions' => [
                    ['emoji' => '👍', 'count' => 2, 'users' => ['current-user', 'user-3']]
                ]
            ]
        ]
    ]
];

try {
    // Подключаемся к MySQL
    $mysqlConfig = require 'config/database_mysql.php';
    $mysqlDb = new PDO(
        "mysql:host={$mysqlConfig['host']};port={$mysqlConfig['port']};dbname={$mysqlConfig['database']};charset={$mysqlConfig['charset']}",
        $mysqlConfig['username'],
        $mysqlConfig['password'],
        $mysqlConfig['options']
    );
    
    echo "✅ Подключение к MySQL установлено\n\n";
    
    // Создаем пользователя по умолчанию
    echo "👤 Создаем пользователя по умолчанию...\n";
    $defaultUserId = 'current-user';
    $stmt = $mysqlDb->prepare("
        INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        email = VALUES(email)
    ");
    $stmt->execute([
        $defaultUserId,
        'Текущий пользователь',
        'user@example.com',
        password_hash('password', PASSWORD_DEFAULT),
        'user'
    ]);
    echo "✅ Пользователь создан\n";
    
    // Импортируем команды
    echo "👥 Импортируем команды...\n";
    foreach ($localStorageData['teams'] as $team) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO teams (id, name, description, color, owner_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
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
            $defaultUserId,
            $team['createdAt'],
            $team['updatedAt']
        ]);
    }
    echo "✅ Команды импортированы: " . count($localStorageData['teams']) . " записей\n";
    
    // Импортируем участников
    echo "👥 Импортируем участников...\n";
    foreach ($localStorageData['members'] as $member) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO team_members (id, team_id, user_id, role, joined_at) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            role = VALUES(role)
        ");
        $stmt->execute([
            $member['id'],
            $member['teamId'],
            $member['userId'],
            $member['role'],
            $member['joinedAt']
        ]);
    }
    echo "✅ Участники импортированы: " . count($localStorageData['members']) . " записей\n";
    
    // Импортируем задачи
    echo "📋 Импортируем задачи...\n";
    foreach ($localStorageData['collaborative_tasks'] as $task) {
        $stmt = $mysqlDb->prepare("
            INSERT INTO tasks (id, title, description, status, priority, user_id, team_id, due_date, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            title = VALUES(title), 
            description = VALUES(description), 
            status = VALUES(status),
            priority = VALUES(priority),
            due_date = VALUES(due_date)
        ");
        $stmt->execute([
            $task['id'],
            $task['title'],
            $task['description'],
            $task['status'],
            $task['priority'],
            $task['createdBy'],
            $task['team']['id'],
            $task['dueDate'],
            $task['createdAt'],
            $task['createdAt']
        ]);
    }
    echo "✅ Задачи импортированы: " . count($localStorageData['collaborative_tasks']) . " записей\n";
    
    // Импортируем сообщения чата
    echo "💬 Импортируем сообщения чата...\n";
    $messageCount = 0;
    foreach ($localStorageData['chat_messages'] as $teamId => $messages) {
        foreach ($messages as $message) {
            $stmt = $mysqlDb->prepare("
                INSERT INTO activity_logs (id, user_id, team_id, action, description, metadata, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                description = VALUES(description)
            ");
            $stmt->execute([
                $message['id'],
                $message['sender']['id'],
                $teamId,
                'chat_message',
                $message['text'],
                json_encode([
                    'type' => $message['type'],
                    'reactions' => $message['reactions'] ?? []
                ]),
                $message['timestamp']
            ]);
            $messageCount++;
        }
    }
    echo "✅ Сообщения чата импортированы: " . $messageCount . " записей\n";
    
    echo "\n🎉 ЭКСПОРТ ЗАВЕРШЕН УСПЕШНО!\n";
    echo "📊 Статистика:\n";
    echo "   👥 Команды: " . count($localStorageData['teams']) . "\n";
    echo "   👥 Участники: " . count($localStorageData['members']) . "\n";
    echo "   📋 Задачи: " . count($localStorageData['collaborative_tasks']) . "\n";
    echo "   💬 Сообщения: " . $messageCount . "\n";
    
    echo "\n🔗 Теперь вы можете подключиться к PHPMyAdmin:\n";
    echo "   URL: http://localhost/phpmyadmin\n";
    echo "   База данных: serenity_db\n";
    echo "   Пользователь: root\n";
    echo "   Пароль: (пустой)\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка экспорта: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


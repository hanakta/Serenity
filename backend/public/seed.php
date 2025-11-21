<?php
// 🐱 Скрипт для добавления тестовых данных в базу данных Serenity

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Database/Database.php';
require_once __DIR__ . '/../src/Models/User.php';
require_once __DIR__ . '/../src/Models/Task.php';
require_once __DIR__ . '/../src/Models/Team.php';

use App\Database\Database;
use App\Models\User;
use App\Models\Task;
use App\Models\Team;
use App\Models\Project;

try {
    $db = Database::getInstance();
    $userModel = new User();
    $taskModel = new Task();
    $teamModel = new Team($db->getConnection());
    $projectModel = new Project();

    echo "🐱 Добавление тестовых данных...\n\n";

    // Создаем тестовых пользователей
    echo "👥 Создание пользователей...\n";

    $users = [
        [
            'email' => 'admin@test.com',
            'name' => 'Администратор',
            'password' => 'password123',
            'role' => 'admin'
        ],
        [
            'email' => 'manager@test.com',
            'name' => 'Менеджер Проектов',
            'password' => 'password123',
            'role' => 'user'
        ],
        [
            'email' => 'developer@test.com',
            'name' => 'Разработчик',
            'password' => 'password123',
            'role' => 'user'
        ],
        [
            'email' => 'designer@test.com',
            'name' => 'Дизайнер',
            'password' => 'password123',
            'role' => 'user'
        ],
        [
            'email' => 'qa@test.com',
            'name' => 'Тестировщик',
            'password' => 'password123',
            'role' => 'user'
        ]
    ];

    $createdUsers = [];
    foreach ($users as $userData) {
        try {
            $user = $userModel->create($userData);
            $createdUsers[] = $user;
            echo "  ✓ Создан пользователь: {$user['name']} ({$user['email']})\n";
        } catch (Exception $e) {
            echo "  ✗ Ошибка создания пользователя {$userData['email']}: " . $e->getMessage() . "\n";
        }
    }

    // Создаем тестовые проекты
    echo "\n📁 Создание проектов...\n";

    $projects = [
        [
            'name' => 'Мобильное приложение Serenity',
            'description' => 'Разработка мобильного приложения для управления задачами',
            'status' => 'active',
            'priority' => 'high',
            'user_id' => $createdUsers[0]['id'] ?? null,
            'team_id' => $createdTeams[0]['id'] ?? null
        ],
        [
            'name' => 'Система аналитики',
            'description' => 'Разработка системы аналитики и отчетности',
            'status' => 'active',
            'priority' => 'medium',
            'user_id' => $createdUsers[1]['id'] ?? null,
            'team_id' => $createdTeams[1]['id'] ?? null
        ],
        [
            'name' => 'Интеграция с внешними сервисами',
            'description' => 'Интеграция с Google Calendar, Slack и другими сервисами',
            'status' => 'planning',
            'priority' => 'medium',
            'user_id' => $createdUsers[2]['id'] ?? null,
            'team_id' => $createdTeams[2]['id'] ?? null
        ]
    ];

    $createdProjects = [];
    foreach ($projects as $projectData) {
        try {
            $project = $projectModel->create($projectData);
            $createdProjects[] = $project;
            echo "  ✓ Создан проект: {$project['name']}\n";
        } catch (Exception $e) {
            echo "  ✗ Ошибка создания проекта {$projectData['name']}: " . $e->getMessage() . "\n";
        }
    }

    // Создаем тестовые команды
    echo "\n👥 Создание команд...\n";

    $teams = [
        [
            'name' => 'Команда разработки',
            'description' => 'Команда разработчиков мобильных приложений',
            'is_public' => true,
            'owner_id' => $createdUsers[0]['id'] ?? null
        ],
        [
            'name' => 'Дизайн команда',
            'description' => 'Команда дизайнеров и UX специалистов',
            'is_public' => true,
            'owner_id' => $createdUsers[0]['id'] ?? null
        ],
        [
            'name' => 'QA команда',
            'description' => 'Команда тестирования и качества',
            'is_public' => false,
            'owner_id' => $createdUsers[1]['id'] ?? null
        ]
    ];

    $createdTeams = [];
    foreach ($teams as $teamData) {
        try {
            $team = $teamModel->create($teamData);
            $createdTeams[] = $team;
            echo "  ✓ Создана команда: {$team['name']}\n";
        } catch (Exception $e) {
            echo "  ✗ Ошибка создания команды {$teamData['name']}: " . $e->getMessage() . "\n";
        }
    }

    // Создаем тестовые задачи
    echo "\n📋 Создание задач...\n";

    $tasks = [
        [
            'title' => 'Разработать API для аутентификации',
            'description' => 'Создать REST API для системы аутентификации пользователей с поддержкой JWT токенов',
            'status' => 'completed',
            'priority' => 'high',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+1 week')),
            'user_id' => $createdUsers[2]['id'] ?? null,
            'team_id' => $createdTeams[0]['id'] ?? null
        ],
        [
            'title' => 'Создать дизайн мобильного приложения',
            'description' => 'Разработать UI/UX дизайн для мобильного приложения с учетом современных трендов',
            'status' => 'in_progress',
            'priority' => 'high',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+2 weeks')),
            'user_id' => $createdUsers[3]['id'] ?? null,
            'team_id' => $createdTeams[1]['id'] ?? null
        ],
        [
            'title' => 'Написать тесты для API',
            'description' => 'Создать комплексные unit и integration тесты для всех API endpoints',
            'status' => 'pending',
            'priority' => 'medium',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+3 weeks')),
            'user_id' => $createdUsers[4]['id'] ?? null,
            'team_id' => $createdTeams[2]['id'] ?? null
        ],
        [
            'title' => 'Оптимизировать базу данных',
            'description' => 'Проанализировать и оптимизировать запросы к базе данных для улучшения производительности',
            'status' => 'pending',
            'priority' => 'medium',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+1 month')),
            'user_id' => $createdUsers[1]['id'] ?? null,
            'team_id' => $createdTeams[0]['id'] ?? null
        ],
        [
            'title' => 'Подготовить документацию',
            'description' => 'Создать подробную техническую документацию для API и архитектуры системы',
            'status' => 'completed',
            'priority' => 'low',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('-1 week')),
            'user_id' => $createdUsers[1]['id'] ?? null,
            'team_id' => $createdTeams[0]['id'] ?? null
        ],
        [
            'title' => 'Обновить зависимости проекта',
            'description' => 'Проверить и обновить все зависимости проекта до последних стабильных версий',
            'status' => 'in_progress',
            'priority' => 'medium',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+1 week')),
            'user_id' => $createdUsers[2]['id'] ?? null,
            'team_id' => $createdTeams[0]['id'] ?? null
        ],
        [
            'title' => 'Настроить CI/CD pipeline',
            'description' => 'Настроить автоматическое тестирование и развертывание приложения',
            'status' => 'pending',
            'priority' => 'high',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+2 weeks')),
            'user_id' => $createdUsers[1]['id'] ?? null,
            'team_id' => $createdTeams[2]['id'] ?? null
        ],
        [
            'title' => 'Провести код-ревью',
            'description' => 'Провести код-ревью для последнего релиза и подготовить отчет',
            'status' => 'pending',
            'priority' => 'medium',
            'category' => 'work',
            'due_date' => date('Y-m-d H:i:s', strtotime('+4 days')),
            'user_id' => $createdUsers[4]['id'] ?? null,
            'team_id' => $createdTeams[2]['id'] ?? null
        ]
    ];

    $createdTasks = [];
    foreach ($tasks as $taskData) {
        try {
            $task = $taskModel->create($taskData);
            $createdTasks[] = $task;
            echo "  ✓ Создана задача: {$task['title']}\n";
        } catch (Exception $e) {
            echo "  ✗ Ошибка создания задачи {$taskData['title']}: " . $e->getMessage() . "\n";
        }
    }

    echo "\n✅ Тестовые данные успешно добавлены!\n";
    echo "📊 Статистика:\n";
    echo "  👥 Пользователей: " . count($createdUsers) . "\n";
    echo "  📁 Проектов: " . count($createdProjects) . "\n";
    echo "  👥 Команд: " . count($createdTeams) . "\n";
    echo "  📋 Задач: " . count($createdTasks) . "\n";
    echo "\n🔐 Учетные данные для входа:\n";

    foreach ($createdUsers as $user) {
        echo "  {$user['email']} - password123 (роль: {$user['role']})\n";
    }

} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "📋 Трейс ошибки:\n" . $e->getTraceAsString() . "\n";
}
?>

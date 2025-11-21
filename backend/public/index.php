<?php


require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Middleware\BodyParsingMiddleware;
use Slim\Middleware\ErrorMiddleware;
use Dotenv\Dotenv;
use App\Middleware\CorsMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Middleware\SimpleAuthMiddleware;
use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\UserController;
use App\Controllers\ProjectController;
use App\Controllers\TeamController;
use App\Controllers\TeamCollaborationController;
use App\Controllers\TeamChatController;
use App\Controllers\TeamInvitationController;
use App\Controllers\TeamFileController;
use App\Controllers\PomodoroController;
use App\Controllers\AdminController;
use App\Models\PomodoroSession;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Database\Database;


$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Инициализация базы данных
$database = Database::getInstance();

// Создание экземпляров контроллеров
$authController = new AuthController($database->getConnection());
$taskController = new TaskController($database->getConnection());
$userController = new UserController($database->getConnection());
$projectController = new ProjectController($database->getConnection());
$teamController = new TeamController($database->getConnection());
$teamChatController = new TeamChatController($database->getConnection());
$teamCollaborationController = new TeamCollaborationController($database->getConnection());
$teamInvitationController = new TeamInvitationController($database->getConnection());
$teamFileController = new TeamFileController($database->getConnection());
$adminController = new AdminController();

// Создание экземпляров для Pomodoro
$pomodoroModel = new PomodoroSession($database->getConnection());
$responseService = new ResponseService();
$validationService = new ValidationService();
$pomodoroController = new PomodoroController($pomodoroModel, $responseService, $validationService);

// Создание приложения Slim
$app = AppFactory::create();

// Добавление middleware
$app->add(new BodyParsingMiddleware());
$app->add(new CorsMiddleware());
$app->add(new ErrorMiddleware(
    $app->getCallableResolver(),
    $app->getResponseFactory(),
    true, // displayErrorDetails
    true, // logErrors
    true  // logErrorDetails
));

// Маршруты аутентификации
$app->group('/api/auth', function ($group) use ($authController) {
    $group->post('/register', [$authController, 'register']);
    $group->post('/login', [$authController, 'login']);
    $group->post('/logout', [$authController, 'logout']);
    $group->post('/refresh', [$authController, 'refresh']);
    $group->get('/me', [$authController, 'me'])->add(new AuthMiddleware());
});

// Маршруты пользователей
$app->group('/api/users', function ($group) use ($userController) {
    $group->get('', [$userController, 'index'])->add(new AuthMiddleware());
    $group->get('/{id}', [$userController, 'show'])->add(new AuthMiddleware());
    $group->put('/{id}', [$userController, 'update'])->add(new AuthMiddleware());
    $group->delete('/{id}', [$userController, 'delete'])->add(new AuthMiddleware());
    $group->get('/{id}/stats', [$userController, 'stats'])->add(new AuthMiddleware());
});

// Маршруты профиля пользователя
$app->group('/api/profile', function ($group) use ($userController) {
    $group->get('', [$userController, 'getProfile'])->add(new AuthMiddleware());
    $group->put('', [$userController, 'updateProfile'])->add(new AuthMiddleware());
    $group->post('/avatar', [$userController, 'uploadAvatar'])->add(new AuthMiddleware());
    $group->get('/avatar', [$userController, 'getAvatar'])->add(new AuthMiddleware());
    $group->delete('/avatar', [$userController, 'deleteAvatar'])->add(new AuthMiddleware());
    $group->post('/change-password', [$userController, 'changePassword'])->add(new AuthMiddleware());
});

// Маршрут для получения аватарки по user_id (публичный)
$app->get('/api/users/{id}/avatar', [$userController, 'getUserAvatar']);

// Маршруты задач
$app->group('/api/tasks', function ($group) use ($taskController) {
    $group->get('/stats/overview', [$taskController, 'stats'])->add(new AuthMiddleware());
    $group->get('/overdue', [$taskController, 'overdue'])->add(new AuthMiddleware());
    $group->get('/today', [$taskController, 'today'])->add(new AuthMiddleware());
    $group->get('', [$taskController, 'index'])->add(new AuthMiddleware());
    $group->post('', [$taskController, 'create'])->add(new AuthMiddleware());
    $group->get('/{id}', [$taskController, 'show'])->add(new AuthMiddleware());
    $group->put('/{id}', [$taskController, 'update'])->add(new AuthMiddleware());
    $group->delete('/{id}', [$taskController, 'delete'])->add(new AuthMiddleware());
});

// Маршруты проектов
$app->group('/api/projects', function ($group) use ($projectController) {
    $group->get('', [$projectController, 'index'])->add(new AuthMiddleware());
    $group->post('', [$projectController, 'create'])->add(new AuthMiddleware());
    $group->get('/{id}', [$projectController, 'show'])->add(new AuthMiddleware());
    $group->put('/{id}', [$projectController, 'update'])->add(new AuthMiddleware());
    $group->delete('/{id}', [$projectController, 'delete'])->add(new AuthMiddleware());
    $group->get('/{id}/tasks', [$projectController, 'tasks'])->add(new AuthMiddleware());
});

// Публичные маршруты команд (доступны всем)
$app->group('/api/teams', function ($group) use ($teamController) {
    $group->get('/public', [$teamController, 'getPublicTeams']); // Только публичные команды
});

// Приватные маршруты команд (требуют аутентификации)
$app->group('/api/teams', function ($group) use ($teamController, $teamInvitationController) {
    $group->get('', [$teamController, 'index'])->add(new AuthMiddleware()); // Мои команды
    $group->get('/{id}', [$teamController, 'show'])->add(new AuthMiddleware()); // Информация о команде
    $group->post('', [$teamController, 'create'])->add(new AuthMiddleware()); // Создание команды
    $group->put('/{id}', [$teamController, 'update'])->add(new AuthMiddleware()); // Обновление команды
    $group->delete('/{id}', [$teamController, 'delete'])->add(new AuthMiddleware()); // Удаление команды
    
    // Присоединение/покидание команды
    $group->post('/{id}/join', [$teamController, 'join'])->add(new AuthMiddleware());
    $group->post('/{id}/leave', [$teamController, 'leave'])->add(new AuthMiddleware());
    
    // Управление участниками
    $group->get('/{id}/members', [$teamController, 'getMembers'])->add(new AuthMiddleware());
    $group->delete('/{id}/members/{member_id}', [$teamController, 'removeMember'])->add(new AuthMiddleware());
    $group->put('/{id}/members/{member_id}', [$teamController, 'updateMemberRole'])->add(new AuthMiddleware());
    
    // Приглашения
    $group->post('/{id}/invite', [$teamInvitationController, 'sendInvitation'])->add(new AuthMiddleware());
    $group->get('/{id}/invitations', [$teamInvitationController, 'getTeamInvitations'])->add(new AuthMiddleware());
    $group->delete('/{id}/invitations/{invitation_id}', [$teamInvitationController, 'cancelInvitation'])->add(new AuthMiddleware());
    
    // Статистика
    $group->get('/{id}/stats', [$teamController, 'getStats'])->add(new AuthMiddleware());
    
    // Командные задачи
    $group->get('/{id}/tasks', [$teamController, 'getTasks'])->add(new AuthMiddleware());
    $group->post('/{id}/tasks', [$teamController, 'createTask'])->add(new AuthMiddleware());
    
    // Командные проекты
    $group->get('/{id}/projects', [$teamController, 'getProjects'])->add(new AuthMiddleware());
});

// Простой тестовый маршрут
$app->get('/api/test', function ($request, $response, $args) {
    $response->getBody()->write(json_encode(['message' => 'Test route works!', 'args' => $args]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Тестовый маршрут с аутентификацией
$app->get('/api/test-auth', function ($request, $response, $args) {
    $userId = AuthMiddleware::getUserId($request);
    $response->getBody()->write(json_encode(['message' => 'Auth test works!', 'user_id' => $userId]));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AuthMiddleware());

// Маршруты коллаборации команд
$app->group('/api/teams/{id}/collaboration', function ($group) use ($teamCollaborationController) {
    $group->get('/activity', [$teamCollaborationController, 'getActivity']);
    $group->post('/activity', [$teamCollaborationController, 'createActivity']);
    $group->post('/manual-activity', [$teamCollaborationController, 'createManualActivity']);
    $group->get('/stats', [$teamCollaborationController, 'getStats']);
    $group->get('/top-users', [$teamCollaborationController, 'getTopActiveUsers']);
    $group->get('/period', [$teamCollaborationController, 'getActivityByPeriod']);
    $group->delete('/cleanup', [$teamCollaborationController, 'cleanupOldActivity']);
    
    // Уведомления команды
    $group->get('/notifications', [$teamCollaborationController, 'getTeamNotifications']);
    $group->post('/notifications/read-all', [$teamCollaborationController, 'markAllNotificationsAsRead']);
})->add(new AuthMiddleware());

// Маршруты чата команд (временно без аутентификации для тестирования)
$app->group('/api/teams/{id}/chat', function ($group) use ($teamChatController) {
    $group->get('/messages', [$teamChatController, 'getMessages']);
    $group->post('/messages', [$teamChatController, 'sendMessage']);
    $group->post('/read', [$teamChatController, 'markAsRead']);
    $group->get('/stats', [$teamChatController, 'getStats']);
    $group->get('/search', [$teamChatController, 'searchMessages']);
    $group->get('/latest', [$teamChatController, 'getLatestMessages']);
});

// Маршруты файлов команд
$app->group('/api/teams/{id}/files', function ($group) use ($teamFileController) {
    $group->get('', [$teamFileController, 'getFiles']);
    $group->post('', [$teamFileController, 'uploadFile']);
    $group->get('/{file_id}', [$teamFileController, 'downloadFile']);
    $group->delete('/{file_id}', [$teamFileController, 'deleteFile']);
})->add(new AuthMiddleware());

// Маршруты приглашений
$app->group('/api/invitations', function ($group) use ($teamInvitationController) {
    $group->get('', [$teamInvitationController, 'getUserInvitations']);
    $group->get('/{token}', [$teamInvitationController, 'getInvitationInfo']);
    $group->post('/{token}/accept', [$teamInvitationController, 'acceptInvitation']);
    $group->post('/{token}/decline', [$teamInvitationController, 'declineInvitation']);
})->add(new AuthMiddleware());

// Маршруты уведомлений
$app->group('/api/notifications', function ($group) use ($teamCollaborationController) {
    $group->post('/{notification_id}/read', [$teamCollaborationController, 'markNotificationAsRead'])->add(new AuthMiddleware());
});

// Маршруты для отдельных сообщений
$app->group('/api/chat/messages', function ($group) use ($teamChatController) {
    $group->put('/{id}', [$teamChatController, 'updateMessage'])->add(new AuthMiddleware());
    $group->delete('/{id}', [$teamChatController, 'deleteMessage'])->add(new AuthMiddleware());
});

// Тестовый маршрут для проверки токена
$app->get('/test-token', function ($request, $response) {
    $authHeader = $request->getHeaderLine('Authorization');
    $token = null;
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    $jwtService = new \App\Services\JWTService();
    
    try {
        $payload = $jwtService->validateToken($token);
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Токен валиден',
            'payload' => $payload
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Ошибка валидации: ' . $e->getMessage()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
});

// Тестовый маршрут для ручных активностей
$app->post('/test-manual-activity', function ($request, $response) use ($teamCollaborationController) {
    $args = ['id' => 'team_demo_123'];
    return $teamCollaborationController->createManualActivity($request, $response, $args);
});

// Простой тестовый маршрут
$app->post('/test-simple', function ($request, $response) {
    $body = $request->getBody()->getContents();
    $data = json_decode($body, true);
    
    $response->getBody()->write(json_encode([
        'success' => true,
        'message' => 'Simple test works',
        'received_data' => $data,
        'body' => $body
    ]));
    
    return $response->withHeader('Content-Type', 'application/json');
});

// Тестовый маршрут для загрузки файлов
$app->post('/test-upload', function ($request, $response) use ($teamFileController) {
    try {
        $args = ['id' => 'team_demo_123'];
        return $teamFileController->uploadFile($request, $response, $args);
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Exception: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

// Тестовый маршрут для проверки FileService
$app->get('/test-fileservice', function ($request, $response) {
    try {
        $fileService = new \App\Services\FileService();
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'FileService created successfully'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Exception: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

// Тестовый маршрут для проверки TeamFileController
$app->get('/test-teamfilecontroller', function ($request, $response) use ($database) {
    try {
        $teamFileController = new \App\Controllers\TeamFileController($database->getConnection());
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'TeamFileController created successfully'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Exception: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


// Простой тест API команд без AuthMiddleware
$app->post('/test-teams', function ($request, $response) {
    $authHeader = $request->getHeaderLine('Authorization');
    $token = null;
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    $jwtService = new \App\Services\JWTService();
    
    try {
        $payload = $jwtService->validateToken($token);
        $userId = $payload['user_id'];
        
        // Получаем данные из запроса
        $data = json_decode($request->getBody()->getContents(), true);
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'API команд работает',
            'user_id' => $userId,
            'data' => $data
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Ошибка: ' . $e->getMessage()
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
});

// Маршрут для главной страницы API
$app->get('/', function ($request, $response) {
    $data = [
        'status' => 'ok',
        'message' => '🐱 Serenity API работает!',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'endpoints' => [
            'health' => '/health',
            'auth' => [
                'register' => 'POST /api/auth/register',
                'login' => 'POST /api/auth/login',
                'me' => 'GET /api/auth/me'
            ],
            'tasks' => [
                'list' => 'GET /api/tasks',
                'create' => 'POST /api/tasks',
                'get' => 'GET /api/tasks/{id}',
                'update' => 'PUT /api/tasks/{id}',
                'delete' => 'DELETE /api/tasks/{id}'
            ],
            'projects' => [
                'list' => 'GET /api/projects',
                'create' => 'POST /api/projects',
                'get' => 'GET /api/projects/{id}',
                'update' => 'PUT /api/projects/{id}',
                'delete' => 'DELETE /api/projects/{id}'
            ]
        ]
    ];
    
    $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    return $response->withHeader('Content-Type', 'application/json');
});

// Маршрут для проверки здоровья API
$app->get('/health', function ($request, $response) {
    $data = [
        'status' => 'ok',
        'message' => '🐱 Serenity API работает!',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ];
    
    $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
    return $response->withHeader('Content-Type', 'application/json');
});

// Pomodoro API маршруты
$app->group('/api/pomodoro', function ($group) use ($pomodoroController) {
    // Создать новую сессию
    $group->post('/sessions', [$pomodoroController, 'createSession'])->add(new AuthMiddleware());
    
    // Получить сессии пользователя
    $group->get('/sessions', [$pomodoroController, 'getSessions'])->add(new AuthMiddleware());
    
    // Получить сессию по ID
    $group->get('/sessions/{id}', [$pomodoroController, 'getSession'])->add(new AuthMiddleware());
    
    // Обновить сессию
    $group->put('/sessions/{id}', [$pomodoroController, 'updateSession'])->add(new AuthMiddleware());
    
    // Удалить сессию
    $group->delete('/sessions/{id}', [$pomodoroController, 'deleteSession'])->add(new AuthMiddleware());
    
    // Получить статистику
    $group->get('/stats', [$pomodoroController, 'getStats'])->add(new AuthMiddleware());
    
    // Получить общую статистику за все время
    $group->get('/stats/lifetime', [$pomodoroController, 'getLifetimeStats'])->add(new AuthMiddleware());
    
    // Получить статистику по неделям
    $group->get('/stats/weekly', [$pomodoroController, 'getWeeklyStats'])->add(new AuthMiddleware());
    
    // Получить статистику по месяцам
    $group->get('/stats/monthly', [$pomodoroController, 'getMonthlyStats'])->add(new AuthMiddleware());
    
    // Получить дневную активность
    $group->get('/activity', [$pomodoroController, 'getDailyActivity'])->add(new AuthMiddleware());
    
    // Получить топ задач
    $group->get('/top-tasks', [$pomodoroController, 'getTopTasks'])->add(new AuthMiddleware());
});

// Админские маршруты
$app->group('/api/admin', function ($group) use ($adminController) {
    // Статистика системы
    $group->get('/stats', [$adminController, 'getSystemStats']);
    
    // Управление пользователями
    $group->get('/users', [$adminController, 'getUsers']);
    $group->get('/users/{id}', [$adminController, 'getUser']);
    $group->post('/users', [$adminController, 'createUser']);
    $group->put('/users/{id}', [$adminController, 'updateUserRole']);
    $group->delete('/users/{id}', [$adminController, 'deleteUser']);
    
    // Управление задачами
    $group->get('/tasks', [$adminController, 'getTasks']);
    $group->post('/tasks', [$adminController, 'createTask']);
    $group->put('/tasks/{id}', [$adminController, 'updateTask']);
    $group->delete('/tasks/{id}', [$adminController, 'deleteTask']);
    
    // Управление командами
    $group->get('/teams', [$adminController, 'getTeams']);
    $group->put('/teams/{id}', [$adminController, 'updateTeam']);
    $group->delete('/teams/{id}', [$adminController, 'deleteTeam']);
    
    // Управление проектами
    $group->get('/projects', [$adminController, 'getProjects']);
    $group->put('/projects/{id}', [$adminController, 'updateProject']);
    $group->delete('/projects/{id}', [$adminController, 'deleteProject']);
    
    // Аналитика
    $group->get('/analytics', [$adminController, 'getAnalytics']);

    // Активность пользователей (более специфичный маршрут должен быть первым)
    $group->get('/activities', [$adminController, 'getRecentActivities']);
    $group->get('/activity', [$adminController, 'getUserActivity']);
})->add(new AdminMiddleware());

// Cookie Consent API маршруты
$app->group('/api/cookies', function ($group) {
    $cookieController = new \App\Controllers\CookieConsentController();
    
    // Сохранить согласие на cookies
    $group->post('/consent', [$cookieController, 'saveConsent']);
    
    // Получить статус согласия
    $group->get('/status', [$cookieController, 'getConsentStatus']);
    
    // Получить типы cookies
    $group->get('/types', [$cookieController, 'getCookieTypes']);
    
    // Получить статистику (только для админов)
    $group->get('/stats', [$cookieController, 'getConsentStats']);
    
    // Очистить старые записи (только для админов)
    $group->delete('/cleanup', [$cookieController, 'cleanupOldRecords']);
});

// Тестовый маршрут
$app->get('/test-admin', function ($request, $response) {
    $response->getBody()->write('Тест маршрута работает!');
    return $response->withHeader('Content-Type', 'text/plain');
});

// Маршрут для создания супер-администратора
$app->get('/create_super_admin.php', function ($request, $response) {
    try {
        $userModel = new User();
        
        // Данные для супер-администратора
        $adminData = [
            'email' => 'admin@serenity.com',
            'name' => 'Супер-администратор',
            'password' => 'admin123',
            'role' => 'super_admin'
        ];

        // Проверяем, существует ли уже супер-администратор
        $existingAdmin = $userModel->findByEmail($adminData['email']);
        
        if ($existingAdmin) {
            // Обновляем роль существующего пользователя
            $userModel->updateRole($existingAdmin['id'], 'super_admin');
            $message = "✅ Супер-администратор уже существует. Роль обновлена.";
        } else {
            // Создаем нового супер-администратора
            $admin = $userModel->create($adminData);
            $message = "✅ Супер-администратор создан успешно!\n📧 Email: " . $adminData['email'] . "\n🔑 Пароль: " . $adminData['password'] . "\n⚠️ ВАЖНО: Измените пароль после первого входа!";
        }

        $html = '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Создание супер-администратора - Serenity</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 600px; width: 100%; }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .result { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; font-family: "Courier New", monospace; white-space: pre-line; border-left: 4px solid #28a745; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 5px; transition: background 0.3s; }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #1e7e34; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ Создание супер-администратора</h1>
        <div class="result">' . $message . '</div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn">🏠 Главная страница</a>
            <a href="/api/auth/login" class="btn btn-success">🔐 Войти в систему</a>
        </div>
    </div>
</body>
</html>';

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');

    } catch (Exception $e) {
        $html = '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ошибка - Serenity</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 600px; width: 100%; }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .result { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; font-family: "Courier New", monospace; white-space: pre-line; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Ошибка создания супер-администратора</h1>
        <div class="result">❌ Ошибка: ' . $e->getMessage() . '
📋 Проверьте настройки базы данных в файле config/database.php</div>
    </div>
</body>
</html>';

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
    }
});

// Обработка 404 ошибок
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
    $data = [
        'error' => 'Not Found',
        'message' => 'Маршрут не найден',
        'path' => $request->getUri()->getPath()
    ];
    
    $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
    return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
});

// Запуск приложения
$app->run();

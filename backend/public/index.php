<?php


require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Middleware\BodyParsingMiddleware;
use Slim\Middleware\ErrorMiddleware;
use Dotenv\Dotenv;
use App\Middleware\CorsMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\SimpleAuthMiddleware;
use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\UserController;
use App\Controllers\ProjectController;
use App\Controllers\TeamController;
use App\Controllers\TeamCollaborationController;
use App\Controllers\TeamChatController;
use App\Controllers\TeamInvitationController;
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

// Маршруты коллаборации команд (временно без аутентификации для тестирования)
$app->group('/api/teams/{id}/collaboration', function ($group) use ($teamCollaborationController) {
    $group->get('/activity', [$teamCollaborationController, 'getActivity']);
    $group->post('/activity', [$teamCollaborationController, 'createActivity']);
    $group->get('/stats', [$teamCollaborationController, 'getStats']);
    $group->get('/top-users', [$teamCollaborationController, 'getTopActiveUsers']);
    $group->get('/period', [$teamCollaborationController, 'getActivityByPeriod']);
    $group->delete('/cleanup', [$teamCollaborationController, 'cleanupOldActivity']);
});

// Маршруты чата команд (временно без аутентификации для тестирования)
$app->group('/api/teams/{id}/chat', function ($group) use ($teamChatController) {
    $group->get('/messages', [$teamChatController, 'getMessages']);
    $group->post('/messages', [$teamChatController, 'sendMessage']);
    $group->post('/read', [$teamChatController, 'markAsRead']);
    $group->get('/stats', [$teamChatController, 'getStats']);
    $group->get('/search', [$teamChatController, 'searchMessages']);
    $group->get('/latest', [$teamChatController, 'getLatestMessages']);
});

// Маршруты приглашений (временно без аутентификации для тестирования)
$app->group('/api/invitations', function ($group) use ($teamInvitationController) {
    $group->get('', [$teamInvitationController, 'getUserInvitations']);
    $group->get('/{token}', [$teamInvitationController, 'getInvitationInfo']);
    $group->post('/{token}/accept', [$teamInvitationController, 'acceptInvitation']);
    $group->post('/{token}/decline', [$teamInvitationController, 'declineInvitation']);
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

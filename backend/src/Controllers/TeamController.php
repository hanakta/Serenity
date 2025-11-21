<?php

namespace App\Controllers;

use App\Models\Team;
use App\Models\TeamCollaboration;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Services\JWTService;

class TeamController
{
    private $db;
    private $teamModel;
    private $collaborationModel;
    private $responseService;
    private $validationService;
    private $jwtService;

    public function __construct($database)
    {
        $this->db = $database;
        $this->teamModel = new Team($database);
        $this->collaborationModel = new TeamCollaboration($database);
        $this->responseService = new ResponseService();
        $this->validationService = new ValidationService();
        $this->jwtService = new JWTService();
    }

    /**
     * Получить все команды пользователя
     */
    public function index($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            
            $teams = $this->teamModel->getByUserId($userId);
            
            return $this->responseService->success($teams, 'Команды успешно получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения команд: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения команд', 500);
        }
    }

    /**
     * Получить все публичные команды (доступно всем пользователям)
     */
    public function getPublicTeams($request, $response, $args)
    {
        try {
            $queryParams = $request->getQueryParams();
            $limit = $queryParams['limit'] ?? 20;
            $offset = $queryParams['offset'] ?? 0;
            $search = $queryParams['search'] ?? '';
            
            $teams = $this->teamModel->getPublicTeams($limit, $offset, $search);
            
            return $this->responseService->success($teams, 'Публичные команды получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения публичных команд: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения публичных команд', 500);
        }
    }

    /**
     * Создать новую команду
     */
    public function create($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'name' => 'required|string|max:255',
                'description' => 'string|max:1000',
                'color' => 'string|max:7'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error('Ошибки валидации', 400, $validation['errors']);
            }

            $teamData = [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'color' => $data['color'] ?? '#3B82F6',
                'owner_id' => $userId
            ];

            $team = $this->teamModel->create($teamData);
            
            if ($team) {
                // Создаем активность
                $this->collaborationModel->create([
                    'team_id' => $team['id'],
                    'user_id' => $userId,
                    'activity_type' => 'team_created',
                    'activity_data' => [
                        'team_name' => $team['name'],
                        'team_color' => $team['color']
                    ]
                ]);

                return $this->responseService->success($team, 'Команда успешно создана', 201);
            } else {
                return $this->responseService->error('Ошибка создания команды', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания команды: " . $e->getMessage());
            return $this->responseService->error('Ошибка создания команды', 500);
        }
    }

    /**
     * Получить команду по ID
     */
    public function show($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            $team = $this->teamModel->findById($teamId);
            
            if (!$team) {
                return $this->responseService->error($response, 'Команда не найдена', 404);
            }

            // Проверяем, является ли пользователь участником команды
            $userRole = $this->teamModel->isMember($teamId, $userId);
            if (!$userRole) {
                return $this->responseService->error($response, 'Доступ запрещен', 403);
            }

            return $this->responseService->success($response, $team, 'Команда успешно получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения команды: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения команды', 500);
        }
    }

    /**
     * Обновить команду
     */
    public function update($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем права доступа
            if (!$this->teamModel->isOwner($teamId, $userId)) {
                return $this->responseService->error($response, 'Недостаточно прав для изменения команды', 403);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'name' => 'string|max:255',
                'description' => 'string|max:1000',
                'color' => 'string|max:7'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $team = $this->teamModel->update($teamId, $data);
            
            if ($team) {
                // Создаем активность
                $this->collaborationModel->create([
                    'team_id' => $teamId,
                    'user_id' => $userId,
                    'activity_type' => 'team_updated',
                    'activity_data' => [
                        'team_name' => $team['name'],
                        'changes' => array_keys($data)
                    ]
                ]);

                return $this->responseService->success($response, $team, 'Команда успешно обновлена');
            } else {
                return $this->responseService->error($response, 'Ошибка обновления команды', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка обновления команды: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка обновления команды', 500);
        }
    }

    /**
     * Удалить команду
     */
    public function delete($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем права доступа
            if (!$this->teamModel->isOwner($teamId, $userId)) {
                return $this->responseService->error($response, 'Недостаточно прав для удаления команды', 403);
            }

            $result = $this->teamModel->delete($teamId);
            
            if ($result) {
                return $this->responseService->success($response, null, 'Команда успешно удалена');
            } else {
                return $this->responseService->error($response, 'Ошибка удаления команды', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка удаления команды: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка удаления команды', 500);
        }
    }

    /**
     * Присоединиться к команде
     */
    public function join($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            
            $teamId = $args['id'];
            
            // Проверяем, не является ли пользователь уже участником
            if ($this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Вы уже являетесь участником этой команды', 400);
            }

            $result = $this->teamModel->addMember($teamId, $userId, 'member');
            
            if ($result) {
                // Создаем активность
                $this->collaborationModel->create([
                    'team_id' => $teamId,
                    'user_id' => $userId,
                    'activity_type' => 'member_joined',
                    'activity_data' => [
                        'user_name' => 'Test User'
                    ]
                ]);

                return $this->responseService->success(null, 'Вы успешно присоединились к команде');
            } else {
                return $this->responseService->error('Ошибка присоединения к команде', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка присоединения к команде: " . $e->getMessage());
            return $this->responseService->error('Ошибка присоединения к команде', 500);
        }
    }

    /**
     * Покинуть команду
     */
    public function leave($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь владельцем
            if ($this->teamModel->isOwner($teamId, $userId)) {
                return $this->responseService->error($response, 'Владелец не может покинуть команду. Передайте права другому участнику или удалите команду', 400);
            }

            $result = $this->teamModel->removeMember($teamId, $userId);
            
            if ($result) {
                // Создаем активность
                $this->collaborationModel->create([
                    'team_id' => $teamId,
                    'user_id' => $userId,
                    'activity_type' => 'member_left',
                    'activity_data' => [
                        'user_name' => $this->getCurrentUserName($request)
                    ]
                ]);

                return $this->responseService->success($response, null, 'Вы успешно покинули команду');
            } else {
                return $this->responseService->error($response, 'Ошибка покидания команды', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка покидания команды: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка покидания команды', 500);
        }
    }

    /**
     * Пригласить пользователя в команду
     */
    public function invite($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем права доступа
            $userRole = $this->teamModel->isMember($teamId, $userId);
            if (!in_array($userRole, ['owner', 'admin'])) {
                return $this->responseService->error($response, 'Недостаточно прав для приглашения участников', 403);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'email' => 'required|email',
                'role' => 'in:admin,member,viewer'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            // Здесь должна быть логика отправки приглашения
            // Пока что просто возвращаем успех
            
            return $this->responseService->success($response, null, 'Приглашение отправлено');
        } catch (\Exception $e) {
            error_log("Ошибка отправки приглашения: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка отправки приглашения', 500);
        }
    }

    /**
     * Получить участников команды
     */
    public function getMembers($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error($response, 'Доступ запрещен', 403);
            }

            $members = $this->teamModel->getMembers($teamId);
            
            return $this->responseService->success($response, $members, 'Участники команды получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения участников команды: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения участников команды', 500);
        }
    }

    /**
     * Удалить участника из команды
     */
    public function removeMember($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            $memberId = $args['member_id'];
            
            // Проверяем права доступа
            $userRole = $this->teamModel->isMember($teamId, $userId);
            if (!in_array($userRole, ['owner', 'admin'])) {
                return $this->responseService->error($response, 'Недостаточно прав для удаления участников', 403);
            }

            // Нельзя удалить владельца
            if ($this->teamModel->isOwner($teamId, $memberId)) {
                return $this->responseService->error($response, 'Нельзя удалить владельца команды', 400);
            }

            $result = $this->teamModel->removeMember($teamId, $memberId);
            
            if ($result) {
                return $this->responseService->success($response, null, 'Участник успешно удален из команды');
            } else {
                return $this->responseService->error($response, 'Ошибка удаления участника', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка удаления участника: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка удаления участника', 500);
        }
    }

    /**
     * Обновить роль участника
     */
    public function updateMemberRole($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            $memberId = $args['member_id'];
            
            // Проверяем права доступа
            if (!$this->teamModel->isOwner($teamId, $userId)) {
                return $this->responseService->error($response, 'Недостаточно прав для изменения ролей', 403);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'role' => 'required|in:admin,member,viewer'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $result = $this->teamModel->updateMemberRole($teamId, $memberId, $data['role']);
            
            if ($result) {
                return $this->responseService->success($response, null, 'Роль участника успешно обновлена');
            } else {
                return $this->responseService->error($response, 'Ошибка обновления роли участника', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка обновления роли участника: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка обновления роли участника', 500);
        }
    }

    /**
     * Получить статистику команды
     */
    public function getStats($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            
            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            $stats = $this->teamModel->getStats($teamId);
            
            return $this->responseService->success($stats, 'Статистика команды получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения статистики команды: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения статистики команды', 500);
        }
    }

    /**
     * Получить командные задачи
     */
    public function getTasks($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            
            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            $queryParams = $request->getQueryParams();
            $limit = $queryParams['limit'] ?? 50;
            $offset = $queryParams['offset'] ?? 0;

            // Получаем задачи команды из базы данных
            $taskModel = new \App\Models\Task($this->db);
            $page = intval($offset / $limit) + 1;
            $tasks = $taskModel->getByTeamId($teamId, [], $page, $limit);
            
            return $this->responseService->success(['tasks' => $tasks], 'Командные задачи получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения командных задач: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения командных задач', 500);
        }
    }

    /**
     * Создать командную задачу
     */
    public function createTask($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            
            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'title' => 'required|string|max:255',
                'description' => 'string|max:1000',
                'priority' => 'string|in:low,medium,high,urgent',
                'due_date' => 'date'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error('Ошибки валидации', 400, $validation['errors']);
            }

            // Создаем задачу в базе данных
            $taskModel = new \App\Models\Task($this->db);
            $taskData = [
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'priority' => $data['priority'] ?? 'medium',
                'due_date' => $data['due_date'] ?? null,
                'team_id' => $teamId,
                'user_id' => $userId,
                'status' => 'pending'
            ];
            
            $task = $taskModel->create($taskData);
            
            if ($task) {
                return $this->responseService->success($task, 'Командная задача создана', 201);
            } else {
                return $this->responseService->error('Ошибка создания задачи', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания командной задачи: " . $e->getMessage());
            return $this->responseService->error('Ошибка создания командной задачи', 500);
        }
    }

    /**
     * Получить командные проекты
     */
    public function getProjects($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            $teamId = $args['id'];

            $queryParams = $request->getQueryParams();
            $limit = $queryParams['limit'] ?? 50;
            $offset = $queryParams['offset'] ?? 0;

            // Получаем проекты команды (пока возвращаем пустой массив)
            $projects = [];
            
            return $this->responseService->success(['projects' => $projects], 'Командные проекты получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения командных проектов: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения командных проектов', 500);
        }
    }

    /**
     * Получить онлайн пользователей команды
     */
    public function getOnlineUsers($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            // Получаем онлайн пользователей (пользователи, которые были активны в последние 5 минут)
            $sql = "SELECT DISTINCT u.id, u.name, u.avatar, uos.last_seen
                    FROM users u
                    INNER JOIN user_online_status uos ON u.id = uos.user_id
                    WHERE uos.team_id = :team_id 
                    AND uos.is_online = 1 
                    AND uos.last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
                    ORDER BY uos.last_seen DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            $onlineUsers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return $this->responseService->success(['online_users' => $onlineUsers], 'Онлайн пользователи получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения онлайн пользователей: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения онлайн пользователей', 500);
        }
    }

    /**
     * Отметить пользователя как онлайн
     */
    public function markUserOnline($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            // Обновляем или создаем запись о онлайн статусе
            $sql = "INSERT INTO user_online_status (id, user_id, team_id, is_online, last_seen, created_at, updated_at)
                    VALUES (:id, :user_id, :team_id, 1, NOW(), NOW(), NOW())
                    ON DUPLICATE KEY UPDATE 
                    is_online = 1, 
                    last_seen = NOW(), 
                    updated_at = NOW()";

            $stmt = $this->db->prepare($sql);
            $statusId = 'status_' . uniqid();
            $result = $stmt->execute([
                ':id' => $statusId,
                ':user_id' => $userId,
                ':team_id' => $teamId
            ]);

            if ($result) {
                return $this->responseService->success(null, 'Пользователь отмечен как онлайн');
            } else {
                return $this->responseService->error('Ошибка отметки пользователя как онлайн', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отметки пользователя как онлайн: " . $e->getMessage());
            return $this->responseService->error('Ошибка отметки пользователя как онлайн', 500);
        }
    }

    /**
     * Отметить пользователя как оффлайн
     */
    public function markUserOffline($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];

            // Обновляем статус пользователя на оффлайн
            $sql = "UPDATE user_online_status 
                    SET is_online = 0, updated_at = NOW() 
                    WHERE user_id = :user_id AND team_id = :team_id";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':user_id' => $userId,
                ':team_id' => $teamId
            ]);

            if ($result) {
                return $this->responseService->success(null, 'Пользователь отмечен как оффлайн');
            } else {
                return $this->responseService->error('Ошибка отметки пользователя как оффлайн', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отметки пользователя как оффлайн: " . $e->getMessage());
            return $this->responseService->error('Ошибка отметки пользователя как оффлайн', 500);
        }
    }

    /**
     * Получить ID текущего пользователя из JWT токена
     */
    private function getCurrentUserId($request)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];
        
        try {
            $payload = $this->jwtService->validateToken($token);
            
            // Дополнительная проверка валидности токена
            if (!$payload || !isset($payload['user_id']) || empty($payload['user_id'])) {
                return null;
            }
            
            // Проверяем, что токен не истек
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                error_log("Token expired for user: " . $payload['user_id']);
                return null;
            }
            
            return $payload['user_id'];
        } catch (\Exception $e) {
            error_log("Token validation error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Получить имя текущего пользователя из JWT токена
     */
    private function getCurrentUserName($request)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return 'Неизвестный пользователь';
        }

        $token = $matches[1];
        $payload = $this->jwtService->validateToken($token);
        
        return $payload ? $payload['name'] : 'Неизвестный пользователь';
    }
}

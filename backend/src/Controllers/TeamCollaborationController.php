<?php

namespace App\Controllers;

use App\Models\TeamCollaboration;
use App\Models\Team;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Services\JWTService;

class TeamCollaborationController
{
    private $collaborationModel;
    private $teamModel;
    private $responseService;
    private $validationService;
    private $jwtService;

    public function __construct($database)
    {
        $this->collaborationModel = new TeamCollaboration($database);
        $this->teamModel = new Team($database);
        $this->responseService = new ResponseService();
        $this->validationService = new ValidationService();
        $this->jwtService = new JWTService();
    }

    /**
     * Получить активность команды
     */
    public function getActivity($request, $response, $args)
    {
        try {
            // Временно используем фиксированный user_id для тестирования
            $userId = 'user_68c6db922ef080.86987837';
            $teamId = $args['id'];

            $queryParams = $request->getQueryParams();
            $limit = $queryParams['limit'] ?? 50;
            $offset = $queryParams['offset'] ?? 0;

            $activities = $this->collaborationModel->getByTeamId($teamId, $limit, $offset);
            
            return $this->responseService->success(['activities' => $activities], 'Активность команды получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения активности команды: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения активности команды', 500);
        }
    }

    /**
     * Создать активность
     */
    public function createActivity($request, $response, $args)
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

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'activity_type' => 'required|string|max:100',
                'activity_data' => 'required|array',
                'target_id' => 'integer',
                'target_type' => 'string|max:50'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => $data['activity_type'],
                'activity_data' => $data['activity_data'],
                'target_id' => $data['target_id'] ?? null,
                'target_type' => $data['target_type'] ?? null
            ];

            $activity = $this->collaborationModel->create($activityData);
            
            if ($activity) {
                return $this->responseService->success($response, $activity, 'Активность создана', 201);
            } else {
                return $this->responseService->error($response, 'Ошибка создания активности', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания активности: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка создания активности', 500);
        }
    }

    /**
     * Получить активность по типу
     */
    public function getActivityByType($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            $activityType = $args['type'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error($response, 'Доступ запрещен', 403);
            }

            $limit = $request->getQueryParam('limit', 20);
            $activities = $this->collaborationModel->getByType($teamId, $activityType, $limit);
            
            return $this->responseService->success($response, $activities, 'Активность по типу получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения активности по типу: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения активности по типу', 500);
        }
    }

    /**
     * Получить активность пользователя в команде
     */
    public function getUserActivity($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            $targetUserId = $args['user_id'] ?? $userId;
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error($response, 'Доступ запрещен', 403);
            }

            $limit = $request->getQueryParam('limit', 20);
            $activities = $this->collaborationModel->getByUserInTeam($teamId, $targetUserId, $limit);
            
            return $this->responseService->success($response, $activities, 'Активность пользователя получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения активности пользователя: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения активности пользователя', 500);
        }
    }

    /**
     * Получить статистику активности
     */
    public function getStats($request, $response, $args)
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

            $days = $request->getQueryParam('days', 30);
            $stats = $this->collaborationModel->getStats($teamId, $days);
            
            return $this->responseService->success($response, $stats, 'Статистика активности получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения статистики активности: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения статистики активности', 500);
        }
    }

    /**
     * Получить топ активных пользователей
     */
    public function getTopActiveUsers($request, $response, $args)
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

            $limit = $request->getQueryParam('limit', 10);
            $days = $request->getQueryParam('days', 30);
            $users = $this->collaborationModel->getTopActiveUsers($teamId, $limit, $days);
            
            return $this->responseService->success($response, $users, 'Топ активных пользователей получен');
        } catch (\Exception $e) {
            error_log("Ошибка получения топ активных пользователей: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения топ активных пользователей', 500);
        }
    }

    /**
     * Получить активность за период
     */
    public function getActivityByPeriod($request, $response, $args)
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

            $startDate = $request->getQueryParam('start_date');
            $endDate = $request->getQueryParam('end_date');

            if (!$startDate || !$endDate) {
                return $this->responseService->error($response, 'Необходимо указать start_date и end_date', 400);
            }

            $activities = $this->collaborationModel->getActivityByPeriod($teamId, $startDate, $endDate);
            
            return $this->responseService->success($response, $activities, 'Активность за период получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения активности за период: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка получения активности за период', 500);
        }
    }

    /**
     * Очистить старую активность
     */
    public function cleanupOldActivity($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error($response, 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь владельцем команды
            if (!$this->teamModel->isOwner($teamId, $userId)) {
                return $this->responseService->error($response, 'Недостаточно прав для очистки активности', 403);
            }

            $days = $request->getQueryParam('days', 90);
            $deletedCount = $this->collaborationModel->cleanupOldActivities($days);
            
            return $this->responseService->success($response, ['deleted_count' => $deletedCount], 'Старая активность очищена');
        } catch (\Exception $e) {
            error_log("Ошибка очистки старой активности: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка очистки старой активности', 500);
        }
    }

    /**
     * Создать активность для задачи
     */
    public function createTaskActivity($request, $response, $args)
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

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'activity_type' => 'required|in:task_created,task_updated,task_completed,task_deleted',
                'task_data' => 'required|array'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $activity = $this->collaborationModel->createTaskActivity(
                $teamId, 
                $userId, 
                $data['activity_type'], 
                $data['task_data']
            );
            
            if ($activity) {
                return $this->responseService->success($response, $activity, 'Активность задачи создана', 201);
            } else {
                return $this->responseService->error($response, 'Ошибка создания активности задачи', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания активности задачи: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка создания активности задачи', 500);
        }
    }

    /**
     * Создать активность для проекта
     */
    public function createProjectActivity($request, $response, $args)
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

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'activity_type' => 'required|in:project_created,project_updated,project_deleted',
                'project_data' => 'required|array'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $activity = $this->collaborationModel->createProjectActivity(
                $teamId, 
                $userId, 
                $data['activity_type'], 
                $data['project_data']
            );
            
            if ($activity) {
                return $this->responseService->success($response, $activity, 'Активность проекта создана', 201);
            } else {
                return $this->responseService->error($response, 'Ошибка создания активности проекта', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания активности проекта: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка создания активности проекта', 500);
        }
    }

    /**
     * Создать активность для файла
     */
    public function createFileActivity($request, $response, $args)
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

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'activity_type' => 'required|in:file_uploaded,file_downloaded,file_deleted',
                'file_data' => 'required|array'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $activity = $this->collaborationModel->createFileActivity(
                $teamId, 
                $userId, 
                $data['activity_type'], 
                $data['file_data']
            );
            
            if ($activity) {
                return $this->responseService->success($response, $activity, 'Активность файла создана', 201);
            } else {
                return $this->responseService->error($response, 'Ошибка создания активности файла', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания активности файла: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка создания активности файла', 500);
        }
    }

    /**
     * Создать активность для комментария
     */
    public function createCommentActivity($request, $response, $args)
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

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'activity_type' => 'required|in:comment_added,comment_updated,comment_deleted',
                'comment_data' => 'required|array'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, $validation['errors'], 400);
            }

            $activity = $this->collaborationModel->createCommentActivity(
                $teamId, 
                $userId, 
                $data['activity_type'], 
                $data['comment_data']
            );
            
            if ($activity) {
                return $this->responseService->success($response, $activity, 'Активность комментария создана', 201);
            } else {
                return $this->responseService->error($response, 'Ошибка создания активности комментария', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка создания активности комментария: " . $e->getMessage());
            return $this->responseService->error($response, 'Ошибка создания активности комментария', 500);
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
        $payload = $this->jwtService->validateToken($token);
        
        return $payload ? $payload['user_id'] : null;
    }
}

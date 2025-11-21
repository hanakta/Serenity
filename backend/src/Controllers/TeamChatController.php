<?php

namespace App\Controllers;

use App\Models\TeamChatMessage;
use App\Models\Team;
use App\Models\TeamCollaboration;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Services\JWTService;
use App\Services\TeamActivityService;

class TeamChatController
{
    private $chatModel;
    private $teamModel;
    private $collaborationModel;
    private $responseService;
    private $validationService;
    private $jwtService;
    private $activityService;

    public function __construct($database)
    {
        $this->chatModel = new TeamChatMessage($database);
        $this->teamModel = new Team($database);
        $this->collaborationModel = new TeamCollaboration($database);
        $this->responseService = new ResponseService();
        $this->validationService = new ValidationService();
        $this->jwtService = new JWTService();
        $this->activityService = new TeamActivityService();
    }

    /**
     * Получить сообщения команды
     */
    public function getMessages($request, $response, $args)
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

            $queryParams = $request->getQueryParams();
            $limit = $queryParams['limit'] ?? 50;
            $offset = $queryParams['offset'] ?? 0;

            $result = $this->chatModel->getByTeamId($teamId, $limit, $offset, $userId);
            
            return $this->responseService->success($result, 'Сообщения получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения сообщений: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения сообщений', 500);
        }
    }

    /**
     * Отправить сообщение
     */
    public function sendMessage($request, $response, $args)
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

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'message' => 'required|string|max:2000',
                'message_type' => 'in:text,image,file,system',
                'reply_to_id' => 'integer'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error( $validation['errors'], 400);
            }

            $messageData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'message' => $data['message'],
                'message_type' => $data['message_type'] ?? 'text',
                'reply_to_id' => $data['reply_to_id'] ?? null
            ];

            $message = $this->chatModel->create($messageData);
            
            if ($message) {
                // Создаем активность через TeamActivityService
                $this->activityService->createMessageSentActivity(
                    $message['id'],
                    $userId,
                    $teamId,
                    $data
                );

                return $this->responseService->success($message, 'Сообщение отправлено', 201);
            } else {
                return $this->responseService->error('Ошибка отправки сообщения', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отправки сообщения: " . $e->getMessage());
            return $this->responseService->error('Ошибка отправки сообщения', 500);
        }
    }

    /**
     * Обновить сообщение
     */
    public function updateMessage($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $messageId = $args['id'];
            
            // Проверяем права на редактирование
            if (!$this->chatModel->canEdit($messageId, $userId)) {
                return $this->responseService->error( 'Недостаточно прав для редактирования сообщения', 403);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'message' => 'required|string|max:2000'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error( $validation['errors'], 400);
            }

            $message = $this->chatModel->update($messageId, $data);
            
            if ($message) {
                return $this->responseService->success($response, $message, 'Сообщение обновлено');
            } else {
                return $this->responseService->error( 'Ошибка обновления сообщения', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка обновления сообщения: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка обновления сообщения', 500);
        }
    }

    /**
     * Удалить сообщение
     */
    public function deleteMessage($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $messageId = $args['id'];
            
            // Получаем роль пользователя в команде
            $message = $this->chatModel->findById($messageId);
            if (!$message) {
                return $this->responseService->error( 'Сообщение не найдено', 404);
            }

            $userRole = $this->teamModel->isMember($message['team_id'], $userId);
            
            // Проверяем права на удаление
            if (!$this->chatModel->canDelete($messageId, $userId, $userRole)) {
                return $this->responseService->error( 'Недостаточно прав для удаления сообщения', 403);
            }

            $result = $this->chatModel->delete($messageId);
            
            if ($result) {
                return $this->responseService->success($response, null, 'Сообщение удалено');
            } else {
                return $this->responseService->error( 'Ошибка удаления сообщения', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка удаления сообщения: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка удаления сообщения', 500);
        }
    }

    /**
     * Отметить сообщения как прочитанные
     */
    public function markAsRead($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error( 'Доступ запрещен', 403);
            }

            $data = $request->getParsedBody();
            
            // Валидация
            $validation = $this->validationService->validate($data, [
                'message_ids' => 'required|array',
                'message_ids.*' => 'integer'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error( $validation['errors'], 400);
            }

            $result = $this->chatModel->markAsRead($teamId, $userId, $data['message_ids']);
            
            if ($result) {
                return $this->responseService->success($response, null, 'Сообщения отмечены как прочитанные');
            } else {
                return $this->responseService->error( 'Ошибка отметки сообщений как прочитанных', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отметки сообщений как прочитанных: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка отметки сообщений как прочитанных', 500);
        }
    }

    /**
     * Получить количество непрочитанных сообщений
     */
    public function getUnreadCount($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error( 'Доступ запрещен', 403);
            }

            $unreadCount = $this->chatModel->getUnreadCount($teamId, $userId);
            
            return $this->responseService->success($response, ['unread_count' => $unreadCount], 'Количество непрочитанных сообщений получено');
        } catch (\Exception $e) {
            error_log("Ошибка получения количества непрочитанных сообщений: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка получения количества непрочитанных сообщений', 500);
        }
    }

    /**
     * Поиск сообщений
     */
    public function searchMessages($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error( 'Доступ запрещен', 403);
            }

            $query = $request->getQueryParam('q', '');
            $limit = $request->getQueryParam('limit', 20);

            if (empty($query)) {
                return $this->responseService->error( 'Поисковый запрос не может быть пустым', 400);
            }

            $messages = $this->chatModel->search($teamId, $query, $limit);
            
            return $this->responseService->success($response, $messages, 'Результаты поиска получены');
        } catch (\Exception $e) {
            error_log("Ошибка поиска сообщений: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка поиска сообщений', 500);
        }
    }

    /**
     * Получить статистику чата
     */
    public function getStats($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error( 'Доступ запрещен', 403);
            }

            $days = $request->getQueryParam('days', 30);
            $stats = $this->chatModel->getStats($teamId, $days);
            
            return $this->responseService->success($response, $stats, 'Статистика чата получена');
        } catch (\Exception $e) {
            error_log("Ошибка получения статистики чата: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка получения статистики чата', 500);
        }
    }

    /**
     * Получить последние сообщения
     */
    public function getLatestMessages($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error( 'Неавторизованный доступ', 401);
            }

            $teamId = $args['id'];
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error( 'Доступ запрещен', 403);
            }

            $limit = $request->getQueryParam('limit', 10);
            $messages = $this->chatModel->getLatestMessages($teamId, $limit);
            
            return $this->responseService->success($response, $messages, 'Последние сообщения получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения последних сообщений: " . $e->getMessage());
            return $this->responseService->error( 'Ошибка получения последних сообщений', 500);
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

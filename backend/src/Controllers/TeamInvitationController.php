<?php

namespace App\Controllers;

use App\Models\TeamInvitation;
use App\Models\Team;
use App\Models\User;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Services\TeamNotificationService;
use App\Services\JWTService;

class TeamInvitationController
{
    private $invitationModel;
    private $responseService;
    private $database;
    private $jwtService;

    public function __construct($database)
    {
        $this->database = $database;
        $this->invitationModel = new TeamInvitation($database);
        $this->responseService = new ResponseService();
        $this->jwtService = new JWTService();
    }

    /**
     * Отправить приглашение
     */
    public function sendInvitation($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            
            $teamId = $args['id'];
            $data = $request->getParsedBody();

            // Простая валидация
            if (empty($data['email'])) {
                return $this->responseService->error('Email обязателен', 400);
            }

            // Создаем приглашение
            $invitationData = [
                'team_id' => $teamId,
                'email' => $data['email'],
                'role' => $data['role'] ?? 'member',
                'invited_by' => $userId
            ];

            $invitation = $this->invitationModel->create($invitationData);

            if ($invitation) {
                return $this->responseService->success($invitation, 'Приглашение отправлено', 201);
            } else {
                return $this->responseService->error('Ошибка создания приглашения', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отправки приглашения: " . $e->getMessage());
            return $this->responseService->error('Ошибка отправки приглашения: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить приглашения команды
     */
    public function getTeamInvitations($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $invitations = $this->invitationModel->getByTeamId($teamId);

            return $this->responseService->success(['invitations' => $invitations], 'Приглашения получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения приглашений: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения приглашений', 500);
        }
    }

    /**
     * Получить приглашения пользователя
     */
    public function getUserInvitations($request, $response, $args)
    {
        try {
            // Получаем токен из заголовка
            $authHeader = $request->getHeaderLine('Authorization');
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $this->responseService->error('Токен не найден', 401);
            }

            $token = $matches[1];
            
            // Валидируем токен и получаем user_id
            $jwtService = new \App\Services\JWTService();
            $payload = $jwtService->validateToken($token);
            if (!$payload) {
                return $this->responseService->error('Недействительный токен', 401);
            }

            $userId = $payload['user_id'];

            // Получаем email пользователя
            $userModel = new \App\Models\User($this->database);
            $user = $userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            $invitations = $this->invitationModel->getByEmail($user['email']);

            return $this->responseService->success(['invitations' => $invitations], 'Приглашения получены');
        } catch (\Exception $e) {
            error_log("Ошибка получения приглашений пользователя: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения приглашений', 500);
        }
    }

    /**
     * Принять приглашение
     */
    public function acceptInvitation($request, $response, $args)
    {
        try {
            // Получаем токен из заголовка
            $authHeader = $request->getHeaderLine('Authorization');
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $this->responseService->error('Токен не найден', 401);
            }

            $token = $matches[1];
            
            // Валидируем токен и получаем user_id
            $jwtService = new \App\Services\JWTService();
            $payload = $jwtService->validateToken($token);
            if (!$payload) {
                return $this->responseService->error('Недействительный токен', 401);
            }

            $userId = $payload['user_id'];
            $invitationToken = $args['token'];

            $invitation = $this->invitationModel->accept($invitationToken, $userId);

            if ($invitation) {
                return $this->responseService->success($invitation, 'Приглашение принято');
            } else {
                return $this->responseService->error('Приглашение не найдено или просрочено', 404);
            }
        } catch (\Exception $e) {
            error_log("Ошибка принятия приглашения: " . $e->getMessage());
            return $this->responseService->error('Ошибка принятия приглашения', 500);
        }
    }

    /**
     * Отклонить приглашение
     */
    public function declineInvitation($request, $response, $args)
    {
        try {
            $token = $args['token'];

            $result = $this->invitationModel->decline($token);

            if ($result) {
                return $this->responseService->success([], 'Приглашение отклонено');
            } else {
                return $this->responseService->error('Приглашение не найдено', 404);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отклонения приглашения: " . $e->getMessage());
            return $this->responseService->error('Ошибка отклонения приглашения', 500);
        }
    }

    /**
     * Отменить приглашение
     */
    public function cancelInvitation($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            $invitationId = $args['id'];

            // Проверяем, может ли пользователь отменить приглашение
            $invitation = $this->invitationModel->findById($invitationId);
            if (!$invitation || $invitation['invited_by'] !== $userId) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            $result = $this->invitationModel->cancel($invitationId);

            if ($result) {
                return $this->responseService->success([], 'Приглашение отменено');
            } else {
                return $this->responseService->error('Ошибка отмены приглашения', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка отмены приглашения: " . $e->getMessage());
            return $this->responseService->error('Ошибка отмены приглашения', 500);
        }
    }

    /**
     * Удалить приглашение
     */
    public function deleteInvitation($request, $response, $args)
    {
        try {
            // Получаем ID пользователя из JWT токена
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            $invitationId = $args['id'];

            // Проверяем, может ли пользователь удалить приглашение
            $invitation = $this->invitationModel->findById($invitationId);
            if (!$invitation || $invitation['invited_by'] !== $userId) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            $result = $this->invitationModel->delete($invitationId);

            if ($result) {
                return $this->responseService->success([], 'Приглашение удалено');
            } else {
                return $this->responseService->error('Ошибка удаления приглашения', 500);
            }
        } catch (\Exception $e) {
            error_log("Ошибка удаления приглашения: " . $e->getMessage());
            return $this->responseService->error('Ошибка удаления приглашения', 500);
        }
    }

    /**
     * Получить информацию о приглашении по токену
     */
    public function getInvitationInfo($request, $response, $args)
    {
        try {
            $token = $args['token'];
            $invitation = $this->invitationModel->findByToken($token);

            if ($invitation) {
                return $this->responseService->success($invitation, 'Информация о приглашении получена');
            } else {
                return $this->responseService->error('Приглашение не найдено или просрочено', 404);
            }
        } catch (\Exception $e) {
            error_log("Ошибка получения информации о приглашении: " . $e->getMessage());
            return $this->responseService->error('Ошибка получения информации о приглашении', 500);
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
                return null;
            }
            
            return $payload['user_id'];
        } catch (\Exception $e) {
            error_log("JWT Validation Error: " . $e->getMessage());
            error_log("Token: " . $token);
            return null;
        }
    }
}

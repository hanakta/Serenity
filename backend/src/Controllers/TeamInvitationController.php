<?php

namespace App\Controllers;

use App\Models\TeamInvitation;
use App\Models\Team;
use App\Models\User;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Services\TeamNotificationService;

class TeamInvitationController
{
    private $invitationModel;
    private $responseService;

    public function __construct($database)
    {
        $this->invitationModel = new TeamInvitation($database);
        $this->responseService = new ResponseService();
    }

    /**
     * Отправить приглашение
     */
    public function sendInvitation($request, $response, $args)
    {
        try {
            // Временно используем фиксированный user_id для тестирования
            $userId = 'user_68c6db922ef080.86987837';
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
            // Временно используем фиксированный user_id для тестирования
            $userId = 'user_68c6db922ef080.86987837';

            // Получаем email пользователя
            $user = $this->userModel->findById($userId);
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
            // Временно используем фиксированный user_id для тестирования
            $userId = 'user_68c6db922ef080.86987837';
            $token = $args['token'];

            $invitation = $this->invitationModel->accept($token, $userId);

            if ($invitation) {
                // Отправляем уведомление команде
                $this->notificationService->createNotification($invitation['team_id'], $userId, 'member_joined', [
                    'user_name' => $this->userModel->findById($userId)['name'],
                    'team_name' => $this->teamModel->findById($invitation['team_id'])['name']
                ]);

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
            // Временно используем фиксированный user_id для тестирования
            $userId = 'user_68c6db922ef080.86987837';
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
            // Временно используем фиксированный user_id для тестирования
            $userId = 'user_68c6db922ef080.86987837';
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
}

<?php

namespace App\Controllers;

use App\Models\Team;
use App\Models\User;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Middleware\AuthMiddleware;

class TeamController
{
    private $teamModel;
    private $userModel;
    private $responseService;
    private $validationService;

    public function __construct()
    {
        $this->teamModel = new Team();
        $this->userModel = new User();
        $this->responseService = new ResponseService();
        $this->validationService = new ValidationService();
    }

    /**
     * Создать новую команду
     */
    public function create($request, $response)
    {
        try {
            $data = $request->getParsedBody();
            $userId = $request->getAttribute('user_id');

            // Валидация
            $errors = $this->validationService->validateTeamCreation($data);
            if (!empty($errors)) {
                return $this->responseService->error('Ошибки валидации', 400, $errors);
            }

            $data['owner_id'] = $userId;
            $team = $this->teamModel->create($data);

            if ($team) {
                return $this->responseService->success($team, 'Команда успешно создана', 201);
            } else {
                return $this->responseService->error('Ошибка создания команды', 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error('Внутренняя ошибка сервера', 500);
        }
    }

    /**
     * Получить команды пользователя
     */
    public function getUserTeams($request, $response)
    {
        try {
            $userId = $request->getAttribute('user_id');
            $teams = $this->teamModel->getUserTeams($userId);

            return $this->responseService->success($teams, 'Команды получены');
        } catch (\Exception $e) {
            return $this->responseService->error('Внутренняя ошибка сервера', 500);
        }
    }

    /**
     * Получить команду по ID
     */
    public function getById($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $userId = $request->getAttribute('user_id');

            // Проверяем права доступа
            if (!$this->teamModel->hasPermission($teamId, $userId, 'read')) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            $team = $this->teamModel->findById($teamId);
            if (!$team) {
                return $this->responseService->error('Команда не найдена', 404);
            }

            // Получаем участников команды
            $members = $this->teamModel->getMembers($teamId);
            $team['members'] = $members;

            return $this->responseService->success($team, 'Команда получена');
        } catch (\Exception $e) {
            return $this->responseService->error('Внутренняя ошибка сервера', 500);
        }
    }

    /**
     * Обновить команду
     */
    public function update($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();

            // Проверяем права доступа
            if (!$this->teamModel->hasPermission($teamId, $userId, 'write')) {
                return $this->responseService->error( 'Доступ запрещен', [], 403);
            }

            $result = $this->teamModel->update($teamId, $data);
            if ($result) {
                $team = $this->teamModel->findById($teamId);
                return $this->responseService->success( 'Команда обновлена', $team);
            } else {
                return $this->responseService->error( 'Ошибка обновления команды', [], 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Удалить команду
     */
    public function delete($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $userId = $request->getAttribute('user_id');

            // Проверяем права доступа (только владелец может удалить)
            if (!$this->teamModel->hasPermission($teamId, $userId, 'delete')) {
                return $this->responseService->error( 'Доступ запрещен', [], 403);
            }

            $result = $this->teamModel->delete($teamId);
            if ($result) {
                return $this->responseService->success( 'Команда удалена');
            } else {
                return $this->responseService->error( 'Ошибка удаления команды', [], 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Добавить участника в команду
     */
    public function addMember($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();

            // Проверяем права доступа
            if (!$this->teamModel->hasPermission($teamId, $userId, 'manage_members')) {
                return $this->responseService->error( 'Доступ запрещен', [], 403);
            }

            // Проверяем, что пользователь существует
            $user = $this->userModel->findByEmail($data['email']);
            if (!$user) {
                return $this->responseService->error( 'Пользователь не найден', [], 404);
            }

            // Проверяем, что пользователь еще не в команде
            if ($this->teamModel->isMember($teamId, $user['id'])) {
                return $this->responseService->error( 'Пользователь уже в команде', [], 400);
            }

            $result = $this->teamModel->addMember($teamId, $user['id'], $data['role'] ?? 'member', $userId);
            if ($result) {
                return $this->responseService->success( 'Участник добавлен в команду');
            } else {
                return $this->responseService->error( 'Ошибка добавления участника', [], 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Удалить участника из команды
     */
    public function removeMember($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $memberId = $args['member_id'];
            $userId = $request->getAttribute('user_id');

            // Проверяем права доступа
            if (!$this->teamModel->hasPermission($teamId, $userId, 'manage_members')) {
                return $this->responseService->error( 'Доступ запрещен', [], 403);
            }

            $result = $this->teamModel->removeMember($teamId, $memberId);
            if ($result) {
                return $this->responseService->success( 'Участник удален из команды');
            } else {
                return $this->responseService->error( 'Ошибка удаления участника', [], 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Обновить роль участника
     */
    public function updateMemberRole($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $memberId = $args['member_id'];
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();

            // Проверяем права доступа
            if (!$this->teamModel->hasPermission($teamId, $userId, 'manage_members')) {
                return $this->responseService->error( 'Доступ запрещен', [], 403);
            }

            $result = $this->teamModel->updateMemberRole($teamId, $memberId, $data['role']);
            if ($result) {
                return $this->responseService->success( 'Роль участника обновлена');
            } else {
                return $this->responseService->error( 'Ошибка обновления роли', [], 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Пригласить пользователя в команду
     */
    public function inviteUser($request, $response, $args)
    {
        try {
            $teamId = $args['id'];
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();

            // Проверяем права доступа
            if (!$this->teamModel->hasPermission($teamId, $userId, 'manage_members')) {
                return $this->responseService->error( 'Доступ запрещен', [], 403);
            }

            $invitation = $this->teamModel->createInvitation(
                $teamId,
                $data['email'],
                $data['role'] ?? 'member',
                $userId
            );

            if ($invitation) {
                return $this->responseService->success( 'Приглашение отправлено', $invitation);
            } else {
                return $this->responseService->error( 'Ошибка создания приглашения', [], 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Принять приглашение в команду
     */
    public function acceptInvitation($request, $response)
    {
        try {
            $data = $request->getParsedBody();
            $userId = $request->getAttribute('user_id');

            if (empty($data['token'])) {
                return $this->responseService->error( 'Токен приглашения обязателен', [], 400);
            }

            $result = $this->teamModel->acceptInvitation($data['token'], $userId);
            if ($result) {
                return $this->responseService->success( 'Приглашение принято');
            } else {
                return $this->responseService->error( 'Неверный или истекший токен приглашения', [], 400);
            }
        } catch (\Exception $e) {
            return $this->responseService->error( 'Внутренняя ошибка сервера', [], 500);
        }
    }
}

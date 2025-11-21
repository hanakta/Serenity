<?php

namespace App\Controllers;

use App\Models\PomodoroSession;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Middleware\AuthMiddleware;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PomodoroController
{
    private $pomodoroModel;
    private $responseService;
    private $validationService;

    public function __construct(PomodoroSession $pomodoroModel, ResponseService $responseService, ValidationService $validationService)
    {
        $this->pomodoroModel = $pomodoroModel;
        $this->responseService = $responseService;
        $this->validationService = $validationService;
    }

    /**
     * Создать новую сессию Pomodoro
     */
    public function createSession(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            $userId = $request->getAttribute('user_id');

            // Валидация данных (поддерживаем оба формата полей)
            $validation = $this->validationService->validate($data, [
                'task_id' => 'optional|nullable|string',
                'taskId' => 'optional|nullable|string',
                'task_title' => 'optional|nullable|string|max:255',
                'taskTitle' => 'optional|nullable|string|max:255',
                'start_time' => 'optional|string',
                'startTime' => 'optional|string',
                'end_time' => 'optional|string',
                'endTime' => 'optional|string',
                'duration' => 'required|integer|min:1',
                'type' => 'required|in:work,break,long_break,focus,shortBreak,longBreak',
                'completed' => 'required|boolean'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->validationError($validation['errors'], 'Ошибка валидации');
            }

            // Маппинг типов с фронтенда на значения базы данных
            $typeMapping = [
                'focus' => 'work',
                'shortBreak' => 'break',
                'longBreak' => 'long_break'
            ];
            
            $sessionData = [
                'user_id' => $userId,
                'task_id' => $data['task_id'] ?? $data['taskId'] ?? null,
                'task_title' => $data['task_title'] ?? $data['taskTitle'] ?? null,
                'start_time' => $data['start_time'] ?? $data['startTime'],
                'end_time' => $data['end_time'] ?? $data['endTime'],
                'duration' => $data['duration'],
                'type' => $typeMapping[$data['type']] ?? $data['type'],
                'completed' => $data['completed']
            ];

            $session = $this->pomodoroModel->create($sessionData);

            return $this->responseService->success($session, 'Сессия создана успешно', 201);
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка создания сессии: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить сессии пользователя
     */
    public function getSessions(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $queryParams = $request->getQueryParams();

            $filters = [];
            if (!empty($queryParams['type'])) {
                $filters['type'] = $queryParams['type'];
            }
            if (!empty($queryParams['date_from'])) {
                $filters['date_from'] = $queryParams['date_from'];
            }
            if (!empty($queryParams['date_to'])) {
                $filters['date_to'] = $queryParams['date_to'];
            }
            if (!empty($queryParams['completed'])) {
                $filters['completed'] = $queryParams['completed'] === 'true';
            }
            if (!empty($queryParams['limit'])) {
                $filters['limit'] = (int)$queryParams['limit'];
            }

            $sessions = $this->pomodoroModel->findByUserId($userId, $filters);

            return $this->responseService->success($sessions, 'Сессии получены успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения сессий: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить статистику пользователя
     */
    public function getStats(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $queryParams = $request->getQueryParams();
            $period = $queryParams['period'] ?? 'week';

            $stats = $this->pomodoroModel->getStats($userId, $period);

            return $this->responseService->success($stats, 'Статистика получена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения статистики: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить дневную активность
     */
    public function getDailyActivity(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $queryParams = $request->getQueryParams();
            $days = (int)($queryParams['days'] ?? 7);

            $activity = $this->pomodoroModel->getDailyActivity($userId, $days);

            return $this->responseService->success($activity, 'Дневная активность получена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения дневной активности: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить топ задач по времени фокуса
     */
    public function getTopTasks(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $queryParams = $request->getQueryParams();
            $limit = (int)($queryParams['limit'] ?? 10);

            $topTasks = $this->pomodoroModel->getTopTasks($userId, $limit);

            return $this->responseService->success($topTasks, 'Топ задач получен успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения топ задач: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить общую статистику за все время
     */
    public function getLifetimeStats(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');

            $stats = $this->pomodoroModel->getLifetimeStats($userId);

            return $this->responseService->success($stats, 'Общая статистика получена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения общей статистики: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить статистику по неделям
     */
    public function getWeeklyStats(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $queryParams = $request->getQueryParams();
            $weeks = (int)($queryParams['weeks'] ?? 12);

            $stats = $this->pomodoroModel->getWeeklyStats($userId, $weeks);

            return $this->responseService->success($stats, 'Недельная статистика получена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения недельной статистики: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить статистику по месяцам
     */
    public function getMonthlyStats(Request $request, Response $response): Response
    {
        try {
            $userId = $request->getAttribute('user_id');
            $queryParams = $request->getQueryParams();
            $months = (int)($queryParams['months'] ?? 12);

            $stats = $this->pomodoroModel->getMonthlyStats($userId, $months);

            return $this->responseService->success($stats, 'Месячная статистика получена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения месячной статистики: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Обновить сессию
     */
    public function updateSession(Request $request, Response $response, array $args): Response
    {
        try {
            $sessionId = (int)$args['id'];
            $userId = $request->getAttribute('user_id');
            $data = json_decode($request->getBody()->getContents(), true);

            // Проверяем, что сессия принадлежит пользователю
            $session = $this->pomodoroModel->findById($sessionId);
            if (empty($session) || $session['user_id'] != $userId) {
                return $this->responseService->notFound('Сессия не найдена');
            }

            // Валидация данных
            $validation = $this->validationService->validate($data, [
                'task_id' => 'optional|integer',
                'task_title' => 'optional|string|max:255',
                'end_time' => 'optional|date',
                'duration' => 'optional|integer|min:1',
                'type' => 'optional|in:focus,shortBreak,longBreak',
                'completed' => 'optional|boolean'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->validationError($validation['errors'], 'Ошибка валидации');
            }

            $updatedSession = $this->pomodoroModel->update($sessionId, $data);

            return $this->responseService->success($updatedSession, 'Сессия обновлена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка обновления сессии: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Удалить сессию
     */
    public function deleteSession(Request $request, Response $response, array $args): Response
    {
        try {
            $sessionId = (int)$args['id'];
            $userId = $request->getAttribute('user_id');

            // Проверяем, что сессия принадлежит пользователю
            $session = $this->pomodoroModel->findById($sessionId);
            if (empty($session) || $session['user_id'] != $userId) {
                return $this->responseService->notFound('Сессия не найдена');
            }

            $deleted = $this->pomodoroModel->delete($sessionId);

            if ($deleted) {
                return $this->responseService->success(null, 'Сессия удалена успешно');
            } else {
                return $this->responseService->error('Ошибка удаления сессии', 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления сессии: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить сессию по ID
     */
    public function getSession(Request $request, Response $response, array $args): Response
    {
        try {
            $sessionId = (int)$args['id'];
            $userId = $request->getAttribute('user_id');

            $session = $this->pomodoroModel->findById($sessionId);

            if (empty($session) || $session['user_id'] != $userId) {
                return $this->responseService->notFound('Сессия не найдена');
            }

            return $this->responseService->success($session, 'Сессия получена успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения сессии: ' . $e->getMessage(), 500);
        }
    }
}


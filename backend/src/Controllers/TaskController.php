<?php
// 🐱 Контроллер задач для Serenity

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Task;
use App\Services\ValidationService;
use App\Services\TeamActivityService;

class TaskController
{
    private Task $taskModel;
    private ValidationService $validator;
    private TeamActivityService $activityService;

    public function __construct()
    {
        $this->taskModel = new Task();
        $this->validator = new ValidationService();
        $this->activityService = new TeamActivityService();
    }

    /**
     * Получить список задач пользователя
     */
    public function index($request, $response)
    {
        $userId = $request->getAttribute('user_id');
        $queryParams = $request->getQueryParams();

        // Валидация пагинации
        $paginationErrors = $this->validator->validatePagination($queryParams);
        if (!empty($paginationErrors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации пагинации',
                'errors' => $paginationErrors
            ], 400);
        }

        $page = (int) ($queryParams['page'] ?? 1);
        $limit = (int) ($queryParams['limit'] ?? 20);

        // Фильтры
        $filters = [
            'status' => $queryParams['status'] ?? null,
            'priority' => $queryParams['priority'] ?? null,
            'category' => $queryParams['category'] ?? null,
            'project_id' => $queryParams['project_id'] ?? null,
            'search' => $queryParams['search'] ?? null,
            'due_date_from' => $queryParams['due_date_from'] ?? null,
            'due_date_to' => $queryParams['due_date_to'] ?? null,
            'sort_by' => $queryParams['sort_by'] ?? 'created_at',
            'sort_order' => $queryParams['sort_order'] ?? 'DESC'
        ];

        // Преобразуем строковые значения в массивы где нужно
        if ($filters['status'] && is_string($filters['status'])) {
            $filters['status'] = explode(',', $filters['status']);
        }
        if ($filters['priority'] && is_string($filters['priority'])) {
            $filters['priority'] = explode(',', $filters['priority']);
        }
        if ($filters['category'] && is_string($filters['category'])) {
            $filters['category'] = explode(',', $filters['category']);
        }

        try {
            $tasks = $this->taskModel->getByUserId($userId, $filters, $page, $limit);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $tasks,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => count($tasks) // В реальном приложении здесь должен быть общий счетчик
                ]
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении задач: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Создать новую задачу
     */
    public function create($request, $response)
    {
        $userId = $request->getAttribute('user_id');
        
        // Отладочная информация
        error_log("TaskController::create - User ID from token: " . $userId);
        
        // Проверяем, что пользователь существует
        $userModel = new \App\Models\User();
        $user = $userModel->findById($userId);
        if (!$user) {
            error_log("TaskController::create - User not found with ID: " . $userId);
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Пользователь не найден'
            ], 404);
        }
        
        error_log("TaskController::create - User found: " . json_encode($user));
        
        // Попробуем получить данные из тела запроса
        $body = $request->getBody()->getContents();
        $data = json_decode($body, true);
        
        if (!$data) {
            $data = $request->getParsedBody();
        }
        
        $data['user_id'] = $userId;
        
        // Отладочная информация
        error_log("TaskController::create - Received data: " . json_encode($data));

        // Валидация данных
        $errors = $this->validator->validateTask($data);
        if (!empty($errors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $errors,
                'debug' => [
                    'received_data' => $data,
                    'validation_errors' => $errors
                ]
            ], 400);
        }

        try {
            $task = $this->taskModel->create($data);

            // Создаем активность для команды, если задача принадлежит команде
            if (!empty($data['team_id'])) {
                $this->activityService->createTaskCreatedActivity(
                    $task['id'],
                    $userId,
                    $data['team_id'],
                    $data
                );
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Задача успешно создана',
                'data' => $task
            ], 201);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при создании задачи: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить задачу по ID
     */
    public function show($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $taskId = $args['id'];

        if (!$this->validator->validateTaskId($taskId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID задачи'
            ], 400);
        }

        try {
            $task = $this->taskModel->findById($taskId);

            if (!$task) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Задача не найдена'
                ], 404);
            }

            // Проверяем, что задача принадлежит пользователю
            if ($task['user_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Доступ запрещен'
                ], 403);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $task
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении задачи: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обновить задачу
     */
    public function update($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $taskId = $args['id'];
        $data = $request->getParsedBody();

        if (!$this->validator->validateTaskId($taskId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID задачи'
            ], 400);
        }

        // Валидация данных для обновления
        $errors = $this->validator->validateTaskUpdate($data);
        if (!empty($errors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $errors
            ], 400);
        }

        try {
            // Проверяем существование задачи и принадлежность пользователю
            $existingTask = $this->taskModel->findById($taskId);
            if (!$existingTask) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Задача не найдена'
                ], 404);
            }

            if ($existingTask['user_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Доступ запрещен'
                ], 403);
            }

            $task = $this->taskModel->update($taskId, $data);

            // Создаем активность для команды, если задача принадлежит команде
            if (!empty($existingTask['team_id'])) {
                $this->activityService->createTaskUpdatedActivity(
                    $taskId,
                    $userId,
                    $existingTask['team_id'],
                    $existingTask,
                    $task
                );
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Задача успешно обновлена',
                'data' => $task
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при обновлении задачи: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удалить задачу
     */
    public function delete($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $taskId = $args['id'];

        if (!$this->validator->validateTaskId($taskId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID задачи'
            ], 400);
        }

        try {
            // Проверяем существование задачи и принадлежность пользователю
            $existingTask = $this->taskModel->findById($taskId);
            if (!$existingTask) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Задача не найдена'
                ], 404);
            }

            if ($existingTask['user_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Доступ запрещен'
                ], 403);
            }

            $deleted = $this->taskModel->delete($taskId);

            if ($deleted) {
                return $this->jsonResponse($response, [
                    'success' => true,
                    'message' => 'Задача успешно удалена'
                ]);
            } else {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Ошибка при удалении задачи'
                ], 500);
            }

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при удалении задачи: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить статистику задач
     */
    public function stats($request, $response)
    {
        $userId = $request->getAttribute('user_id');

        try {
            $stats = $this->taskModel->getStats($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении статистики: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить просроченные задачи
     */
    public function overdue($request, $response)
    {
        $userId = $request->getAttribute('user_id');

        try {
            $tasks = $this->taskModel->getOverdueTasks($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $tasks
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении просроченных задач: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить задачи на сегодня
     */
    public function today($request, $response)
    {
        $userId = $request->getAttribute('user_id');

        try {
            $tasks = $this->taskModel->getTodayTasks($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $tasks
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении задач на сегодня: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Вспомогательный метод для JSON ответов
     */
    private function jsonResponse($response, array $data, int $statusCode = 200)
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
    }
}

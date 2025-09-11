<?php
// 🐱 Контроллер проектов для Serenity

namespace App\Controllers;

use App\Models\Project;
use App\Services\ValidationService;

class ProjectController
{
    private Project $projectModel;
    private ValidationService $validator;

    public function __construct()
    {
        $this->projectModel = new Project();
        $this->validator = new ValidationService();
    }

    /**
     * Получить список проектов пользователя
     */
    public function index($request, $response)
    {
        $userId = $request->getAttribute('user_id');
        $queryParams = $request->getQueryParams();
        $page = (int) ($queryParams['page'] ?? 1);
        $limit = (int) ($queryParams['limit'] ?? 20);

        try {
            $projects = $this->projectModel->getByUserId($userId, $page, $limit);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $projects
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении проектов: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Создать новый проект
     */
    public function create($request, $response)
    {
        $userId = $request->getAttribute('user_id');
        $data = $request->getParsedBody();
        $data['user_id'] = $userId;

        // Валидация данных
        $errors = $this->validator->validateProject($data);
        if (!empty($errors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $errors
            ], 400);
        }

        try {
            $project = $this->projectModel->create($data);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Проект успешно создан',
                'data' => $project
            ], 201);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при создании проекта: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить проект по ID
     */
    public function show($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $projectId = $args['id'];

        if (!$this->validator->validateUUID($projectId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID проекта'
            ], 400);
        }

        try {
            $project = $this->projectModel->findById($projectId);

            if (!$project) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Проект не найден'
                ], 404);
            }

            // Проверяем, что проект принадлежит пользователю
            if ($project['user_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Доступ запрещен'
                ], 403);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $project
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении проекта: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обновить проект
     */
    public function update($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $projectId = $args['id'];
        $data = $request->getParsedBody();

        if (!$this->validator->validateUUID($projectId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID проекта'
            ], 400);
        }

        // Валидация данных
        $errors = $this->validator->validateProject($data);
        if (!empty($errors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $errors
            ], 400);
        }

        try {
            // Проверяем существование проекта и принадлежность пользователю
            $existingProject = $this->projectModel->findById($projectId);
            if (!$existingProject) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Проект не найден'
                ], 404);
            }

            if ($existingProject['user_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Доступ запрещен'
                ], 403);
            }

            $project = $this->projectModel->update($projectId, $data);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Проект успешно обновлен',
                'data' => $project
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при обновлении проекта: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удалить проект
     */
    public function delete($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $projectId = $args['id'];

        if (!$this->validator->validateUUID($projectId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID проекта'
            ], 400);
        }

        try {
            // Проверяем существование проекта и принадлежность пользователю
            $existingProject = $this->projectModel->findById($projectId);
            if (!$existingProject) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Проект не найден'
                ], 404);
            }

            if ($existingProject['user_id'] !== $userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Доступ запрещен'
                ], 403);
            }

            $deleted = $this->projectModel->delete($projectId);

            if ($deleted) {
                return $this->jsonResponse($response, [
                    'success' => true,
                    'message' => 'Проект успешно удален'
                ]);
            } else {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Ошибка при удалении проекта'
                ], 500);
            }

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при удалении проекта: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить задачи проекта
     */
    public function tasks($request, $response, array $args)
    {
        $userId = $request->getAttribute('user_id');
        $projectId = $args['id'];

        if (!$this->validator->validateUUID($projectId)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Некорректный ID проекта'
            ], 400);
        }

        try {
            $tasks = $this->projectModel->getTasks($projectId, $userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $tasks
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении задач проекта: ' . $e->getMessage()
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

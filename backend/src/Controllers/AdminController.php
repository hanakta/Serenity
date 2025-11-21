<?php
// 🐱 Контроллер для административных функций

namespace App\Controllers;

use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use App\Models\Team;
use App\Database\Database;
use App\Services\ResponseService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdminController
{
    private User $userModel;
    private Task $taskModel;
    private Project $projectModel;
    private Team $teamModel;
    private Database $db;
    private ResponseService $responseService;

    public function __construct()
    {
        $this->userModel = new User();
        $this->taskModel = new Task();
        $this->projectModel = new Project();
        $this->db = Database::getInstance();
        $this->teamModel = new Team($this->db->getConnection());
        $this->responseService = new ResponseService();
    }

    /**
     * Получить общую статистику системы
     */
    public function getSystemStats(Request $request, Response $response): Response
    {
        try {
            // Статистика пользователей
            $totalUsers = $this->userModel->count();
            $activeUsers = $this->getActiveUsers();
            $newUsersToday = $this->getNewUsersToday();
            $usersByRole = $this->getUsersByRole();

            // Статистика задач
            $totalTasks = $this->getTotalTasks();
            $completedTasks = $this->getCompletedTasks();
            $pendingTasks = $this->getPendingTasks();
            $overdueTasks = $this->getOverdueTasks();

            // Статистика команд
            $totalTeams = $this->getTotalTeams();
            $activeTeams = $this->getActiveTeams();
            $publicTeams = $this->getPublicTeams();

            // Статистика проектов
            $totalProjects = $this->getTotalProjects();
            $activeProjects = $this->getActiveProjects();
            $completedProjects = $this->getCompletedProjects();

            $stats = [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'new_today' => $newUsersToday,
                    'by_role' => $usersByRole
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'completed' => $completedTasks,
                    'pending' => $pendingTasks,
                    'overdue' => $overdueTasks
                ],
                'teams' => [
                    'total' => $totalTeams,
                    'active' => $activeTeams,
                    'public' => $publicTeams
                ],
                'projects' => [
                    'total' => $totalProjects,
                    'active' => $activeProjects,
                    'completed' => $completedProjects
                ],
                'system' => [
                    'uptime' => '99.9%',
                    'version' => '1.0.0',
                    'last_backup' => date('Y-m-d H:i:s')
                ]
            ];

            return $this->responseService->success($stats);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения статистики: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить список всех пользователей с пагинацией
     */
    public function getUsers(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int) ($queryParams['page'] ?? 1);
            $limit = (int) ($queryParams['limit'] ?? 20);
            $search = $queryParams['search'] ?? '';

            if ($search) {
                $users = $this->userModel->search($search, $page, $limit);
            } else {
                $users = $this->userModel->getAll($page, $limit);
            }

            $totalUsers = $this->userModel->count();
            $totalPages = ceil($totalUsers / $limit);

            $result = [
                'users' => $users,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalUsers,
                    'items_per_page' => $limit
                ]
            ];

            return $this->responseService->success($result);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения пользователей: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить информацию о конкретном пользователе
     */
    public function getUser(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $args['id'] ?? null;
            
            if (!$userId) {
                return $this->responseService->error('ID пользователя не указан', 400);
            }

            $user = $this->userModel->findById($userId);
            
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Получаем статистику пользователя
            $userStats = $this->userModel->getStats($userId);

            $result = [
                'user' => $user,
                'stats' => $userStats
            ];

            return $this->responseService->success($result);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения пользователя: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Обновить роль пользователя
     */
    public function updateUserRole(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $args['id'] ?? null;
            
            if (!$userId) {
                return $this->responseService->error('ID пользователя не указан', 400);
            }

            $data = json_decode($request->getBody()->getContents(), true);
            $newRole = $data['role'] ?? null;

            if (!$newRole) {
                return $this->responseService->error('Роль не указана', 400);
            }

            $validRoles = ['user', 'admin', 'super_admin'];
            if (!in_array($newRole, $validRoles)) {
                return $this->responseService->error('Недопустимая роль', 400);
            }

            // Проверяем, что пользователь существует
            $user = $this->userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Обновляем роль
            $success = $this->userModel->updateRole($userId, $newRole);
            
            if (!$success) {
                return $this->responseService->error('Ошибка обновления роли', 500);
            }

            $updatedUser = $this->userModel->findById($userId);

            return $this->responseService->success([
                'message' => 'Роль пользователя успешно обновлена',
                'user' => $updatedUser
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка обновления роли: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Удалить пользователя
     */
    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        try {
            $userId = $args['id'] ?? null;
            
            if (!$userId) {
                return $this->responseService->error('ID пользователя не указан', 400);
            }

            // Проверяем, что пользователь существует
            $user = $this->userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Проверяем, что это не супер-администратор
            if ($user['role'] === 'super_admin') {
                return $this->responseService->error('Нельзя удалить супер-администратора', 403);
            }

            // Удаляем пользователя
            $success = $this->userModel->delete($userId);
            
            if (!$success) {
                return $this->responseService->error('Ошибка удаления пользователя', 500);
            }

            return $this->responseService->success([
                'message' => 'Пользователь успешно удален'
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления пользователя: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Создать нового пользователя
     */
    public function createUser(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();
            
            // Валидация данных
            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                return $this->responseService->error('Имя, email и пароль обязательны', 400);
            }

            // Проверяем, что email уникален
            $existingUser = $this->userModel->findByEmail($data['email']);
            if ($existingUser) {
                return $this->responseService->error('Пользователь с таким email уже существует', 409);
            }

            // Создаем пользователя
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'] ?? 'user'
            ];

            $newUser = $this->userModel->create($userData);
            
            if (!$newUser) {
                return $this->responseService->error('Ошибка создания пользователя', 500);
            }

            return $this->responseService->success([
                'message' => 'Пользователь успешно создан',
                'user' => $newUser
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка создания пользователя: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить активность пользователей
     */
    public function getUserActivity(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 50);

            $activity = $this->getRecentUserActivity($limit);

            return $this->responseService->success($activity);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения активности: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить последние активности пользователей для админ-панели
     */
    public function getRecentActivities(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 10);

            $activities = $this->getRecentActivitiesData($limit);

            return $this->responseService->success($activities);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения активностей: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Вспомогательные методы для получения статистики
     */
    private function getTotalTasks(): int
    {
        $sql = "SELECT COUNT(*) as total FROM tasks";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getCompletedTasks(): int
    {
        $sql = "SELECT COUNT(*) as total FROM tasks WHERE status = 'completed'";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getTotalProjects(): int
    {
        $sql = "SELECT COUNT(*) as total FROM projects";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getTotalTeams(): int
    {
        $sql = "SELECT COUNT(*) as total FROM teams";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getNewUsersLast30Days(): int
    {
        $sql = "SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getNewTasksLast30Days(): int
    {
        $sql = "SELECT COUNT(*) as total FROM tasks WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getRecentUserActivity(int $limit): array
    {
        $sql = "SELECT
                    u.id, u.name, u.email, u.role,
                    COUNT(t.id) as task_count,
                    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
                    MAX(t.updated_at) as last_activity
                FROM users u
                LEFT JOIN tasks t ON u.id = t.user_id
                GROUP BY u.id, u.name, u.email, u.role
                ORDER BY last_activity DESC
                LIMIT :limit";

        return $this->db->query($sql, ['limit' => $limit]);
    }

    /**
     * Получить последние активности пользователей в читаемом формате
     */
    private function getRecentActivitiesData(int $limit): array
    {
        $activities = [];

        // 1. Новые пользователи
        $sql = "SELECT id, name, email, created_at
                FROM users
                ORDER BY created_at DESC
                LIMIT 5";

        $newUsers = $this->db->query($sql);
        foreach ($newUsers as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'message' => "Новый пользователь {$user['name']} зарегистрировался",
                'timestamp' => $user['created_at'],
                'icon' => '👤',
                'color' => 'green'
            ];
        }

        // 2. Новые задачи
        $sql = "SELECT t.title, u.name, t.created_at
                FROM tasks t
                JOIN users u ON t.user_id = u.id
                ORDER BY t.created_at DESC
                LIMIT 5";

        $newTasks = $this->db->query($sql);
        foreach ($newTasks as $task) {
            $activities[] = [
                'type' => 'task_created',
                'message' => "{$task['name']} создал задачу: {$task['title']}",
                'timestamp' => $task['created_at'],
                'icon' => '📋',
                'color' => 'blue'
            ];
        }

        // 3. Завершенные задачи
        $sql = "SELECT t.title, u.name, t.updated_at
                FROM tasks t
                JOIN users u ON t.user_id = u.id
                WHERE t.status = 'completed' AND t.completed_at IS NOT NULL
                ORDER BY t.completed_at DESC
                LIMIT 5";

        $completedTasks = $this->db->query($sql);
        foreach ($completedTasks as $task) {
            $activities[] = [
                'type' => 'task_completed',
                'message' => "{$task['name']} завершил задачу: {$task['title']}",
                'timestamp' => $task['updated_at'],
                'icon' => '✅',
                'color' => 'emerald'
            ];
        }

        // 4. Новые команды
        $sql = "SELECT t.name, u.name as owner_name, t.created_at
                FROM teams t
                JOIN users u ON t.owner_id = u.id
                ORDER BY t.created_at DESC
                LIMIT 3";

        $newTeams = $this->db->query($sql);
        foreach ($newTeams as $team) {
            $activities[] = [
                'type' => 'team_created',
                'message' => "{$team['owner_name']} создал команду: {$team['name']}",
                'timestamp' => $team['created_at'],
                'icon' => '👥',
                'color' => 'purple'
            ];
        }

        // Сортируем по времени и берем последние N записей
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($activities, 0, $limit);
    }

    // Новые методы для расширенной статистики

    private function getActiveUsers(): int
    {
        $sql = "SELECT COUNT(DISTINCT user_id) as total FROM tasks WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getNewUsersToday(): int
    {
        $sql = "SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE()";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getUsersByRole(): array
    {
        $sql = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
        $results = $this->db->query($sql);
        $byRole = [];
        foreach ($results as $row) {
            $byRole[$row['role']] = (int) $row['count'];
        }
        return $byRole;
    }

    private function getPendingTasks(): int
    {
        $sql = "SELECT COUNT(*) as total FROM tasks WHERE status IN ('pending', 'in_progress')";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getOverdueTasks(): int
    {
        $sql = "SELECT COUNT(*) as total FROM tasks WHERE due_date < NOW() AND status != 'completed'";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getActiveTeams(): int
    {
        $sql = "SELECT COUNT(DISTINCT team_id) as total FROM team_members WHERE joined_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getPublicTeams(): int
    {
        $sql = "SELECT COUNT(*) as total FROM teams WHERE is_public = 1";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getActiveProjects(): int
    {
        $sql = "SELECT COUNT(*) as total FROM projects WHERE status = 'active'";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    private function getCompletedProjects(): int
    {
        $sql = "SELECT COUNT(*) as total FROM projects WHERE status = 'completed'";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    /**
     * Получить все задачи для админ-панели
     */
    public function getTasks(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int) ($queryParams['page'] ?? 1);
            $limit = (int) ($queryParams['limit'] ?? 20);
            $search = $queryParams['search'] ?? '';
            $status = $queryParams['status'] ?? '';
            $priority = $queryParams['priority'] ?? '';

            $sql = "SELECT t.*, 
                           u.id as user_id, u.name as user_name, u.email as user_email,
                           p.id as project_id, p.name as project_name,
                           tm.id as team_id, tm.name as team_name
                    FROM tasks t
                    LEFT JOIN users u ON t.user_id = u.id
                    LEFT JOIN projects p ON t.project_id = p.id
                    LEFT JOIN teams tm ON t.team_id = tm.id
                    WHERE 1=1";

            $params = [];

            if ($search) {
                $sql .= " AND (t.title LIKE :search OR t.description LIKE :search OR u.name LIKE :search)";
                $params['search'] = "%$search%";
            }

            if ($status) {
                $sql .= " AND t.status = :status";
                $params['status'] = $status;
            }

            if ($priority) {
                $sql .= " AND t.priority = :priority";
                $params['priority'] = $priority;
            }

            $sql .= " ORDER BY t.created_at DESC LIMIT :offset, :limit";
            $params['offset'] = ($page - 1) * $limit;
            $params['limit'] = $limit;

            $rawTasks = $this->db->query($sql, $params);

            // Преобразуем данные в нужный формат
            $tasks = array_map(function($task) {
                return [
                    'id' => $task['id'],
                    'title' => $task['title'],
                    'description' => $task['description'],
                    'status' => $task['status'],
                    'priority' => $task['priority'],
                    'category' => $task['category'],
                    'due_date' => $task['due_date'],
                    'completed_at' => $task['completed_at'],
                    'created_at' => $task['created_at'],
                    'updated_at' => $task['updated_at'],
                    'user' => [
                        'id' => $task['user_id'],
                        'name' => $task['user_name'],
                        'email' => $task['user_email']
                    ],
                    'project' => $task['project_id'] ? [
                        'id' => $task['project_id'],
                        'name' => $task['project_name']
                    ] : null,
                    'team' => $task['team_id'] ? [
                        'id' => $task['team_id'],
                        'name' => $task['team_name']
                    ] : null
                ];
            }, $rawTasks);

            // Получаем общее количество
            $countSql = "SELECT COUNT(*) as total FROM tasks t
                        LEFT JOIN users u ON t.user_id = u.id
                        WHERE 1=1";
            $countParams = [];

            if ($search) {
                $countSql .= " AND (t.title LIKE :search OR t.description LIKE :search OR u.name LIKE :search)";
                $countParams['search'] = "%$search%";
            }

            if ($status) {
                $countSql .= " AND t.status = :status";
                $countParams['status'] = $status;
            }

            if ($priority) {
                $countSql .= " AND t.priority = :priority";
                $countParams['priority'] = $priority;
            }

            $totalResult = $this->db->queryOne($countSql, $countParams);
            $totalTasks = (int) $totalResult['total'];
            $totalPages = ceil($totalTasks / $limit);

            $result = [
                'tasks' => $tasks,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalTasks,
                    'items_per_page' => $limit
                ]
            ];

            return $this->responseService->success($result);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения задач: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Создать новую задачу
     */
    public function createTask(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            // Валидация данных
            if (empty($data['title']) || empty($data['user_id'])) {
                return $this->responseService->error('Название задачи и ID пользователя обязательны', 400);
            }

            // Проверяем, что пользователь существует
            $user = $this->userModel->findById($data['user_id']);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Создаем задачу
            $taskData = [
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'pending',
                'priority' => $data['priority'] ?? 'medium',
                'category' => $data['category'] ?? 'personal',
                'due_date' => $data['due_date'] ?? null,
                'user_id' => $data['user_id'],
                'project_id' => $data['project_id'] ?? null,
                'team_id' => $data['team_id'] ?? null
            ];

            $newTask = $this->taskModel->create($taskData);
            
            if (!$newTask) {
                return $this->responseService->error('Ошибка создания задачи', 500);
            }

            return $this->responseService->success([
                'message' => 'Задача успешно создана',
                'task' => $newTask
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка создания задачи: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Обновить задачу
     */
    public function updateTask(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'] ?? null;
            
            if (!$taskId) {
                return $this->responseService->error('ID задачи не указан', 400);
            }

            $data = json_decode($request->getBody()->getContents(), true);

            // Проверяем, что задача существует
            $task = $this->taskModel->findById($taskId);
            if (!$task) {
                return $this->responseService->error('Задача не найдена', 404);
            }

            // Обновляем задачу
            $success = $this->taskModel->update($taskId, $data);
            
            if (!$success) {
                return $this->responseService->error('Ошибка обновления задачи', 500);
            }

            $updatedTask = $this->taskModel->findById($taskId);

            return $this->responseService->success([
                'message' => 'Задача успешно обновлена',
                'task' => $updatedTask
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка обновления задачи: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Удалить задачу
     */
    public function deleteTask(Request $request, Response $response, array $args): Response
    {
        try {
            $taskId = $args['id'] ?? null;
            
            if (!$taskId) {
                return $this->responseService->error('ID задачи не указан', 400);
            }

            // Проверяем, что задача существует
            $task = $this->taskModel->findById($taskId);
            if (!$task) {
                return $this->responseService->error('Задача не найдена', 404);
            }

            // Удаляем задачу
            $success = $this->taskModel->delete($taskId);
            
            if (!$success) {
                return $this->responseService->error('Ошибка удаления задачи', 500);
            }

            return $this->responseService->success([
                'message' => 'Задача успешно удалена'
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления задачи: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить все команды для админ-панели
     */
    public function getTeams(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int) ($queryParams['page'] ?? 1);
            $limit = (int) ($queryParams['limit'] ?? 20);
            $search = $queryParams['search'] ?? '';
            $visibility = $queryParams['visibility'] ?? '';

            $sql = "SELECT t.*,
                           owner_user.id as owner_id,
                           owner_user.name as owner_name,
                           owner_user.email as owner_email,
                           COUNT(DISTINCT tm.user_id) as members_count,
                           COUNT(DISTINCT task.id) as tasks_count,
                           COUNT(DISTINCT p.id) as projects_count
                    FROM teams t
                    LEFT JOIN team_members owner_tm ON t.id = owner_tm.team_id AND owner_tm.role = 'owner'
                    LEFT JOIN users owner_user ON owner_tm.user_id = owner_user.id
                    LEFT JOIN team_members tm ON t.id = tm.team_id
                    LEFT JOIN tasks task ON t.id = task.team_id
                    LEFT JOIN projects p ON t.id = p.team_id
                    WHERE 1=1";

            $params = [];

            if ($search) {
                $sql .= " AND (t.name LIKE :search OR t.description LIKE :search OR COALESCE(owner_user.name, '') LIKE :search)";
                $params['search'] = "%$search%";
            }

            // Note: is_public field may not exist in all database schemas
            // If it doesn't exist, this filter will be skipped
            if ($visibility) {
                // Try to apply filter, but it may fail if column doesn't exist
                // The error will be caught in the try-catch block
                if ($visibility === 'public') {
                    $sql .= " AND (t.is_public = 1 OR t.is_public IS NULL)";
                } elseif ($visibility === 'private') {
                    $sql .= " AND t.is_public = 0";
                }
            }

            $sql .= " GROUP BY t.id, owner_user.id, owner_user.name, owner_user.email ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset";
            $params['limit'] = $limit;
            $params['offset'] = ($page - 1) * $limit;

            $rawTeams = $this->db->query($sql, $params);

            // Преобразуем данные в нужный формат
            $teams = array_map(function($team) {
                return [
                    'id' => $team['id'] ?? null,
                    'name' => $team['name'] ?? '',
                    'description' => $team['description'] ?? '',
                    'is_public' => isset($team['is_public']) ? (bool) $team['is_public'] : false,
                    'color' => $team['color'] ?? null,
                    'created_at' => $team['created_at'] ?? null,
                    'updated_at' => $team['updated_at'] ?? null,
                    'owner' => [
                        'id' => $team['owner_id'] ?? null,
                        'name' => $team['owner_name'] ?? 'Неизвестно',
                        'email' => $team['owner_email'] ?? ''
                    ],
                    'members_count' => isset($team['members_count']) ? (int) $team['members_count'] : 0,
                    'tasks_count' => isset($team['tasks_count']) ? (int) $team['tasks_count'] : 0,
                    'projects_count' => isset($team['projects_count']) ? (int) $team['projects_count'] : 0
                ];
            }, $rawTeams);

            // Получаем общее количество
            $countSql = "SELECT COUNT(*) as total FROM teams t
                        LEFT JOIN team_members owner_tm ON t.id = owner_tm.team_id AND owner_tm.role = 'owner'
                        LEFT JOIN users owner_user ON owner_tm.user_id = owner_user.id
                        WHERE 1=1";
            $countParams = [];

            if ($search) {
                $countSql .= " AND (t.name LIKE :search OR t.description LIKE :search OR COALESCE(owner_user.name, '') LIKE :search)";
                $countParams['search'] = "%$search%";
            }

            // Note: is_public field may not exist in all database schemas
            if ($visibility) {
                if ($visibility === 'public') {
                    $countSql .= " AND (t.is_public = 1 OR t.is_public IS NULL)";
                } elseif ($visibility === 'private') {
                    $countSql .= " AND t.is_public = 0";
                }
            }

            $totalResult = $this->db->queryOne($countSql, $countParams);
            $totalTeams = (int) $totalResult['total'];
            $totalPages = ceil($totalTeams / $limit);

            $result = [
                'teams' => $teams,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalTeams,
                    'items_per_page' => $limit
                ]
            ];

            return $this->responseService->success($result);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения команд: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Обновить команду
     */
    public function updateTeam(Request $request, Response $response, array $args): Response
    {
        try {
            $teamId = $args['id'] ?? null;
            
            if (!$teamId) {
                return $this->responseService->error('ID команды не указан', 400);
            }

            $data = json_decode($request->getBody()->getContents(), true);

            // Проверяем, что команда существует
            $team = $this->teamModel->findById($teamId);
            if (!$team) {
                return $this->responseService->error('Команда не найдена', 404);
            }

            // Обновляем команду
            $success = $this->teamModel->update($teamId, $data);
            
            if (!$success) {
                return $this->responseService->error('Ошибка обновления команды', 500);
            }

            $updatedTeam = $this->teamModel->findById($teamId);

            return $this->responseService->success([
                'message' => 'Команда успешно обновлена',
                'team' => $updatedTeam
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка обновления команды: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Удалить команду
     */
    public function deleteTeam(Request $request, Response $response, array $args): Response
    {
        try {
            $teamId = $args['id'] ?? null;
            
            if (!$teamId) {
                return $this->responseService->error('ID команды не указан', 400);
            }

            // Проверяем, что команда существует
            $team = $this->teamModel->findById($teamId);
            if (!$team) {
                return $this->responseService->error('Команда не найдена', 404);
            }

            // Удаляем команду
            $success = $this->teamModel->delete($teamId);
            
            if (!$success) {
                return $this->responseService->error('Ошибка удаления команды', 500);
            }

            return $this->responseService->success([
                'message' => 'Команда успешно удалена'
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления команды: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить все проекты для админ-панели
     */
    public function getProjects(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $page = (int) ($queryParams['page'] ?? 1);
            $limit = (int) ($queryParams['limit'] ?? 20);
            $search = $queryParams['search'] ?? '';
            $status = $queryParams['status'] ?? '';
            $priority = $queryParams['priority'] ?? '';

            $sql = "SELECT p.*, u.name as owner_name, u.email as owner_email,
                           t.name as team_name,
                           COUNT(DISTINCT task.id) as tasks_count,
                           COUNT(DISTINCT CASE WHEN task.status = 'completed' THEN task.id END) as completed_tasks,
                           ROUND(COUNT(DISTINCT CASE WHEN task.status = 'completed' THEN task.id END) * 100.0 / COUNT(DISTINCT task.id), 2) as progress
                    FROM projects p
                    LEFT JOIN users u ON p.user_id = u.id
                    LEFT JOIN teams t ON p.team_id = t.id
                    LEFT JOIN tasks task ON p.id = task.project_id
                    WHERE 1=1";

            $params = [];

            if ($search) {
                $sql .= " AND (p.name LIKE :search OR p.description LIKE :search OR u.name LIKE :search)";
                $params['search'] = "%$search%";
            }

            if ($status) {
                $sql .= " AND p.status = :status";
                $params['status'] = $status;
            }

            if ($priority) {
                $sql .= " AND p.priority = :priority";
                $params['priority'] = $priority;
            }

            $sql .= " GROUP BY p.id ORDER BY p.created_at DESC LIMIT :offset, :limit";
            $params['offset'] = ($page - 1) * $limit;
            $params['limit'] = $limit;

            $projects = $this->db->query($sql, $params);

            // Получаем общее количество
            $countSql = "SELECT COUNT(*) as total FROM projects p
                        LEFT JOIN users u ON p.user_id = u.id
                        WHERE 1=1";
            $countParams = [];

            if ($search) {
                $countSql .= " AND (p.name LIKE :search OR p.description LIKE :search OR u.name LIKE :search)";
                $countParams['search'] = "%$search%";
            }

            if ($status) {
                $countSql .= " AND p.status = :status";
                $countParams['status'] = $status;
            }

            if ($priority) {
                $countSql .= " AND p.priority = :priority";
                $countParams['priority'] = $priority;
            }

            $totalResult = $this->db->queryOne($countSql, $countParams);
            $totalProjects = (int) $totalResult['total'];
            $totalPages = ceil($totalProjects / $limit);

            $result = [
                'projects' => $projects,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalProjects,
                    'items_per_page' => $limit
                ]
            ];

            return $this->responseService->success($result);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения проектов: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Обновить проект
     */
    public function updateProject(Request $request, Response $response, array $args): Response
    {
        try {
            $projectId = $args['id'] ?? null;
            
            if (!$projectId) {
                return $this->responseService->error('ID проекта не указан', 400);
            }

            $data = json_decode($request->getBody()->getContents(), true);

            // Проверяем, что проект существует
            $project = $this->projectModel->findById($projectId);
            if (!$project) {
                return $this->responseService->error('Проект не найден', 404);
            }

            // Обновляем проект
            $success = $this->projectModel->update($projectId, $data);
            
            if (!$success) {
                return $this->responseService->error('Ошибка обновления проекта', 500);
            }

            $updatedProject = $this->projectModel->findById($projectId);

            return $this->responseService->success([
                'message' => 'Проект успешно обновлен',
                'project' => $updatedProject
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка обновления проекта: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Удалить проект
     */
    public function deleteProject(Request $request, Response $response, array $args): Response
    {
        try {
            $projectId = $args['id'] ?? null;
            
            if (!$projectId) {
                return $this->responseService->error('ID проекта не указан', 400);
            }

            // Проверяем, что проект существует
            $project = $this->projectModel->findById($projectId);
            if (!$project) {
                return $this->responseService->error('Проект не найден', 404);
            }

            // Удаляем проект
            $success = $this->projectModel->delete($projectId);
            
            if (!$success) {
                return $this->responseService->error('Ошибка удаления проекта', 500);
            }

            return $this->responseService->success([
                'message' => 'Проект успешно удален'
            ]);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления проекта: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Получить аналитику
     */
    public function getAnalytics(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $range = $queryParams['range'] ?? '7d';

            // Определяем период
            $days = 7;
            switch ($range) {
                case '30d':
                    $days = 30;
                    break;
                case '90d':
                    $days = 90;
                    break;
                case '1y':
                    $days = 365;
                    break;
            }

            $analytics = [
                'overview' => $this->getSystemStats($request, $response)->getBody()->getContents(),
                'user_activity' => $this->getUserActivityData($days),
                'task_stats' => $this->getTaskStats(),
                'team_stats' => $this->getTeamStats(),
                'performance' => $this->getPerformanceMetrics()
            ];

            return $this->responseService->success($analytics);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения аналитики: ' . $e->getMessage(), 500);
        }
    }

    private function getUserActivityData(int $days): array
    {
        $sql = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as registrations
                FROM users 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
                GROUP BY DATE(created_at)
                ORDER BY date";
        
        return $this->db->query($sql, ['days' => $days]);
    }

    private function getTaskStats(): array
    {
        $statusStats = $this->db->query("SELECT status, COUNT(*) as count FROM tasks GROUP BY status");
        $priorityStats = $this->db->query("SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority");
        
        $byStatus = [];
        $byPriority = [];
        
        foreach ($statusStats as $row) {
            $byStatus[$row['status']] = (int) $row['count'];
        }
        
        foreach ($priorityStats as $row) {
            $byPriority[$row['priority']] = (int) $row['count'];
        }

        $totalTasks = array_sum($byStatus);
        $completedTasks = $byStatus['completed'] ?? 0;
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

        return [
            'by_status' => $byStatus,
            'by_priority' => $byPriority,
            'completion_rate' => $completionRate,
            'average_completion_time' => 2.3 // Mock data
        ];
    }

    private function getTeamStats(): array
    {
        $sql = "SELECT 
                    COUNT(*) as total_teams,
                    SUM(CASE WHEN is_public = 1 THEN 1 ELSE 0 END) as public_teams,
                    SUM(CASE WHEN is_public = 0 THEN 1 ELSE 0 END) as private_teams,
                    AVG(member_count) as average_members
                FROM (
                    SELECT t.*, COUNT(tm.user_id) as member_count
                    FROM teams t
                    LEFT JOIN team_members tm ON t.id = tm.team_id
                    GROUP BY t.id
                ) team_stats";

        $result = $this->db->queryOne($sql);

        return [
            'total_teams' => (int) $result['total_teams'],
            'public_teams' => (int) $result['public_teams'],
            'private_teams' => (int) $result['private_teams'],
            'average_members' => round((float) $result['average_members'], 1),
            'most_active_teams' => [] // Mock data
        ];
    }

    private function getPerformanceMetrics(): array
    {
        return [
            'response_time' => 120, // Mock data
            'error_rate' => 0.1,
            'database_size' => '2.4 GB',
            'cache_hit_rate' => 94.5
        ];
    }
}

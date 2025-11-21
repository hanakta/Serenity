<?php
// 🐱 Модель задач для Serenity

namespace App\Models;

use App\Database\Database;

class Task
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Создать новую задачу
     */
    public function create(array $data): array
    {
        $sql = "INSERT INTO tasks (id, title, description, status, priority, category, due_date, user_id, project_id, team_id) 
                VALUES (:id, :title, :description, :status, :priority, :category, :due_date, :user_id, :project_id, :team_id)";
        
        // Обработка даты для MySQL
        $dueDate = null;
        if (!empty($data['due_date'])) {
            // Конвертируем ISO дату в MySQL формат
            $dueDate = date('Y-m-d H:i:s', strtotime($data['due_date']));
        }
        
        $params = [
            'id' => uniqid('task_', true),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'priority' => $data['priority'] ?? 'medium',
            'category' => $data['category'] ?? 'personal',
            'due_date' => $dueDate,
            'user_id' => $data['user_id'],
            'project_id' => $data['project_id'] ?? null,
            'team_id' => $data['team_id'] ?? null
        ];

        // Отладочная информация
        error_log("Task::create - SQL: " . $sql);
        error_log("Task::create - Params: " . json_encode($params));

        $this->db->execute($sql, $params);
        $taskId = $params['id'];

        // Добавить теги если есть
        if (!empty($data['tags'])) {
            $this->addTags($taskId, $data['tags']);
        }

        return $this->findById($taskId);
    }

    /**
     * Найти задачу по ID
     */
    public function findById(string $id): ?array
    {
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color, 
                       tm.name as team_name, tm.color as team_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN teams tm ON t.team_id = tm.id
                WHERE t.id = :id";
        
        $task = $this->db->queryOne($sql, ['id' => $id]);
        
        if ($task) {
            $task['tags'] = $this->getTags($id);
        }

        return $task;
    }

    /**
     * Получить все задачи пользователя
     */
    public function getByUserId(string $userId, array $filters = [], int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $where = ['t.user_id = :user_id'];
        $params = ['user_id' => $userId];

        // Применяем фильтры
        if (!empty($filters['status'])) {
            $statusPlaceholders = [];
            foreach ($filters['status'] as $index => $status) {
                $statusPlaceholders[] = ":status_{$index}";
                $params["status_{$index}"] = $status;
            }
            $where[] = 't.status IN (' . implode(',', $statusPlaceholders) . ')';
        }

        if (!empty($filters['priority'])) {
            $priorityPlaceholders = [];
            foreach ($filters['priority'] as $index => $priority) {
                $priorityPlaceholders[] = ":priority_{$index}";
                $params["priority_{$index}"] = $priority;
            }
            $where[] = 't.priority IN (' . implode(',', $priorityPlaceholders) . ')';
        }

        if (!empty($filters['category'])) {
            $categoryPlaceholders = [];
            foreach ($filters['category'] as $index => $category) {
                $categoryPlaceholders[] = ":category_{$index}";
                $params["category_{$index}"] = $category;
            }
            $where[] = 't.category IN (' . implode(',', $categoryPlaceholders) . ')';
        }

        if (!empty($filters['project_id'])) {
            $where[] = 't.project_id = :project_id';
            $params['project_id'] = $filters['project_id'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(t.title LIKE :search OR t.description LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['due_date_from'])) {
            $where[] = 't.due_date >= :due_date_from';
            $params['due_date_from'] = $filters['due_date_from'];
        }

        if (!empty($filters['due_date_to'])) {
            $where[] = 't.due_date <= :due_date_to';
            $params['due_date_to'] = $filters['due_date_to'];
        }

        $whereClause = implode(' AND ', $where);
        $orderBy = $filters['sort_by'] ?? 'created_at';
        $orderDirection = $filters['sort_order'] ?? 'DESC';

        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE {$whereClause}
                ORDER BY t.{$orderBy} {$orderDirection}
                LIMIT :limit OFFSET :offset";

        $params['limit'] = $limit;
        $params['offset'] = $offset;

        $tasks = $this->db->query($sql, $params);

        // Добавляем теги для каждой задачи
        foreach ($tasks as &$task) {
            $task['tags'] = $this->getTags($task['id']);
        }

        return $tasks;
    }

    /**
     * Обновить задачу
     */
    public function update(string $id, array $data): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        $allowedFields = ['title', 'description', 'status', 'priority', 'category', 'due_date', 'project_id'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = :{$field}";
                // Обработка даты для MySQL
                if ($field === 'due_date' && !empty($data[$field])) {
                    $params[$field] = date('Y-m-d H:i:s', strtotime($data[$field]));
                } else {
                    $params[$field] = $data[$field];
                }
            }
        }

        if (empty($fields)) {
            return $this->findById($id);
        }

        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        // Если статус меняется на completed, устанавливаем completed_at
        if (isset($data['status']) && $data['status'] === 'completed') {
            $fields[] = "completed_at = {$nowFunction}";
        } elseif (isset($data['status']) && $data['status'] !== 'completed') {
            $fields[] = 'completed_at = NULL';
        }

        $fields[] = "updated_at = {$nowFunction}";
        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = :id";

        $this->db->execute($sql, $params);

        // Обновить теги если есть
        if (isset($data['tags'])) {
            $this->updateTags($id, $data['tags']);
        }

        return $this->findById($id);
    }

    /**
     * Удалить задачу
     */
    public function delete(string $id): bool
    {
        // Сначала удаляем связанные теги
        $this->db->execute("DELETE FROM task_tags WHERE task_id = :task_id", ['task_id' => $id]);
        
        // Затем удаляем саму задачу
        $sql = "DELETE FROM tasks WHERE id = :id";
        $affected = $this->db->execute($sql, ['id' => $id]);
        return $affected > 0;
    }

    /**
     * Получить теги задачи
     */
    public function getTags(string $taskId): array
    {
        $sql = "SELECT t.id, t.name, t.color 
                FROM tags t
                INNER JOIN task_tags tt ON t.id = tt.tag_id
                WHERE tt.task_id = :task_id";
        
        return $this->db->query($sql, ['task_id' => $taskId]);
    }

    /**
     * Добавить теги к задаче
     */
    public function addTags(string $taskId, array $tagIds): void
    {
        foreach ($tagIds as $tagId) {
            $sql = "INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES (:task_id, :tag_id)";
            $this->db->execute($sql, [
                'task_id' => $taskId,
                'tag_id' => $tagId
            ]);
        }
    }

    /**
     * Обновить теги задачи
     */
    public function updateTags(string $taskId, array $tagIds): void
    {
        // Удаляем все существующие теги
        $this->db->execute("DELETE FROM task_tags WHERE task_id = :task_id", ['task_id' => $taskId]);
        
        // Добавляем новые теги
        $this->addTags($taskId, $tagIds);
    }

    /**
     * Получить статистику задач пользователя
     */
    public function getStats(string $userId): array
    {
        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        $sql = "SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                    SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_tasks,
                    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tasks,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
                    SUM(CASE WHEN due_date < {$nowFunction} AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
                FROM tasks 
                WHERE user_id = :user_id";

        $stats = $this->db->queryOne($sql, ['user_id' => $userId]);

        // Статистика по категориям
        $categorySql = "SELECT category, COUNT(*) as count 
                        FROM tasks 
                        WHERE user_id = :user_id 
                        GROUP BY category";
        
        $categoryStats = $this->db->query($categorySql, ['user_id' => $userId]);
        $stats['by_category'] = array_column($categoryStats, 'count', 'category');

        // Статистика по приоритетам
        $prioritySql = "SELECT priority, COUNT(*) as count 
                        FROM tasks 
                        WHERE user_id = :user_id 
                        GROUP BY priority";
        
        $priorityStats = $this->db->query($prioritySql, ['user_id' => $userId]);
        $stats['by_priority'] = array_column($priorityStats, 'count', 'priority');

        return $stats;
    }

    /**
     * Получить задачи с истекшим сроком
     */
    public function getOverdueTasks(string $userId): array
    {
        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.user_id = :user_id 
                AND t.due_date < {$nowFunction} 
                AND t.status != 'completed'
                ORDER BY t.due_date ASC";

        $tasks = $this->db->query($sql, ['user_id' => $userId]);

        foreach ($tasks as &$task) {
            $task['tags'] = $this->getTags($task['id']);
        }

        return $tasks;
    }

    /**
     * Получить задачи на сегодня
     */
    public function getTodayTasks(string $userId): array
    {
        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $curdateFunction = $dbType === 'sqlite' ? "date('now')" : "CURDATE()";
        
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.user_id = :user_id 
                AND DATE(t.due_date) = {$curdateFunction}
                ORDER BY t.priority DESC, t.created_at ASC";

        $tasks = $this->db->query($sql, ['user_id' => $userId]);

        foreach ($tasks as &$task) {
            $task['tags'] = $this->getTags($task['id']);
        }

        return $tasks;
    }

    /**
     * Получить задачи команды
     */
    public function getByTeamId(string $teamId, array $filters = [], int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color, 
                       tm.name as team_name, tm.color as team_color,
                       u.name as user_name, u.email as user_email
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN teams tm ON t.team_id = tm.id
                LEFT JOIN users u ON t.user_id = u.id
                WHERE t.team_id = :team_id";
        
        $params = ['team_id' => $teamId];
        
        // Применяем фильтры
        if (!empty($filters['status'])) {
            $sql .= " AND t.status = :status";
            $params['status'] = $filters['status'];
        }
        
        if (!empty($filters['priority'])) {
            $sql .= " AND t.priority = :priority";
            $params['priority'] = $filters['priority'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (t.title LIKE :search OR t.description LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }
        
        // Сортировка
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'DESC';
        $sql .= " ORDER BY t.{$sortBy} {$sortOrder}";
        
        // Пагинация
        $sql .= " LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
        
        $tasks = $this->db->query($sql, $params);
        
        foreach ($tasks as &$task) {
            $task['tags'] = $this->getTags($task['id']);
        }
        
        return $tasks;
    }

    /**
     * Получить статистику задач команды
     */
    public function getTeamStats(string $teamId): array
    {
        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
                    SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
                    SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low,
                    SUM(CASE WHEN due_date < {$nowFunction} AND status != 'completed' THEN 1 ELSE 0 END) as overdue
                FROM tasks 
                WHERE team_id = :team_id";
        
        return $this->db->queryOne($sql, ['team_id' => $teamId]);
    }
}

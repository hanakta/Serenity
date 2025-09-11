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
        $sql = "INSERT INTO tasks (id, title, description, status, priority, category, due_date, user_id, project_id) 
                VALUES (:id, :title, :description, :status, :priority, :category, :due_date, :user_id, :project_id)";
        
        $params = [
            'id' => uniqid('task_', true),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'todo',
            'priority' => $data['priority'] ?? 'medium',
            'category' => $data['category'] ?? 'personal',
            'due_date' => $data['due_date'] ?? null,
            'user_id' => $data['user_id'],
            'project_id' => $data['project_id'] ?? null
        ];

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
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
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
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) {
            return $this->findById($id);
        }

        // Если статус меняется на completed, устанавливаем completed_at
        if (isset($data['status']) && $data['status'] === 'completed') {
            $fields[] = 'completed_at = datetime(\'now\')';
        } elseif (isset($data['status']) && $data['status'] !== 'completed') {
            $fields[] = 'completed_at = NULL';
        }

        $fields[] = 'updated_at = datetime(\'now\')';
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
        $sql = "SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                    SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_tasks,
                    SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tasks,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
                    SUM(CASE WHEN due_date < datetime('now') AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
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
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.user_id = :user_id 
                AND t.due_date < datetime('now') 
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
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.user_id = :user_id 
                AND date(t.due_date) = date('now')
                ORDER BY t.priority DESC, t.created_at ASC";

        $tasks = $this->db->query($sql, ['user_id' => $userId]);

        foreach ($tasks as &$task) {
            $task['tags'] = $this->getTags($task['id']);
        }

        return $tasks;
    }
}

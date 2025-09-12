<?php
// 🐱 Модель проектов для Serenity

namespace App\Models;

use App\Database\Database;

class Project
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Создать новый проект
     */
    public function create(array $data): array
    {
        $sql = "INSERT INTO projects (id, name, description, color, user_id) 
                VALUES (:id, :name, :description, :color, :user_id)";
        
        $params = [
            'id' => uniqid('project_', true),
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? '#3B82F6',
            'user_id' => $data['user_id']
        ];

        $this->db->execute($sql, $params);
        $projectId = $params['id'];

        return $this->findById($projectId);
    }

    /**
     * Найти проект по ID
     */
    public function findById(string $id): ?array
    {
        $sql = "SELECT * FROM projects WHERE id = :id";
        return $this->db->queryOne($sql, ['id' => $id]);
    }

    /**
     * Получить все проекты пользователя
     */
    public function getByUserId(string $userId, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT p.*, 
                       COUNT(t.id) as task_count,
                       SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
                FROM projects p
                LEFT JOIN tasks t ON p.id = t.project_id
                WHERE p.user_id = :user_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset";
        
        $params = [
            'user_id' => $userId,
            'limit' => $limit,
            'offset' => $offset
        ];

        return $this->db->query($sql, $params);
    }

    /**
     * Обновить проект
     */
    public function update(string $id, array $data): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params['name'] = $data['name'];
        }

        if (isset($data['description'])) {
            $fields[] = 'description = :description';
            $params['description'] = $data['description'];
        }

        if (isset($data['color'])) {
            $fields[] = 'color = :color';
            $params['color'] = $data['color'];
        }

        if (empty($fields)) {
            return $this->findById($id);
        }

        $fields[] = 'updated_at = datetime(\'now\')';
        $sql = "UPDATE projects SET " . implode(', ', $fields) . " WHERE id = :id";

        $this->db->execute($sql, $params);
        return $this->findById($id);
    }

    /**
     * Удалить проект
     */
    public function delete(string $id): bool
    {
        $sql = "DELETE FROM projects WHERE id = :id";
        $affected = $this->db->execute($sql, ['id' => $id]);
        return $affected > 0;
    }

    /**
     * Получить задачи проекта
     */
    public function getTasks(string $projectId, string $userId): array
    {
        $sql = "SELECT t.*, p.name as project_name, p.color as project_color
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.project_id = :project_id AND t.user_id = :user_id
                ORDER BY t.created_at DESC";
        
        $params = [
            'project_id' => $projectId,
            'user_id' => $userId
        ];

        $tasks = $this->db->query($sql, $params);

        // Добавляем теги для каждой задачи
        foreach ($tasks as &$task) {
            $task['tags'] = $this->getTaskTags($task['id']);
        }

        return $tasks;
    }

    /**
     * Получить теги задачи
     */
    private function getTaskTags(string $taskId): array
    {
        $sql = "SELECT t.id, t.name, t.color 
                FROM tags t
                INNER JOIN task_tags tt ON t.id = tt.tag_id
                WHERE tt.task_id = :task_id";
        
        return $this->db->query($sql, ['task_id' => $taskId]);
    }

    /**
     * Получить статистику проекта
     */
    public function getStats(string $projectId, string $userId): array
    {
        $sql = "SELECT 
                    COUNT(t.id) as total_tasks,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                    SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todo_tasks,
                    SUM(CASE WHEN t.priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tasks,
                    SUM(CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
                FROM tasks t
                WHERE t.project_id = :project_id AND t.user_id = :user_id";

        $stats = $this->db->queryOne($sql, [
            'project_id' => $projectId,
            'user_id' => $userId
        ]);

        // Статистика по категориям
        $categorySql = "SELECT t.category, COUNT(*) as count 
                        FROM tasks t
                        WHERE t.project_id = :project_id AND t.user_id = :user_id
                        GROUP BY t.category";
        
        $categoryStats = $this->db->query($categorySql, [
            'project_id' => $projectId,
            'user_id' => $userId
        ]);
        $stats['by_category'] = array_column($categoryStats, 'count', 'category');

        // Статистика по приоритетам
        $prioritySql = "SELECT t.priority, COUNT(*) as count 
                        FROM tasks t
                        WHERE t.project_id = :project_id AND t.user_id = :user_id
                        GROUP BY t.priority";
        
        $priorityStats = $this->db->query($prioritySql, [
            'project_id' => $projectId,
            'user_id' => $userId
        ]);
        $stats['by_priority'] = array_column($priorityStats, 'count', 'priority');

        return $stats;
    }

    /**
     * Поиск проектов
     */
    public function search(string $userId, string $query, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $searchTerm = "%{$query}%";
        
        $sql = "SELECT p.*, 
                       COUNT(t.id) as task_count,
                       SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
                FROM projects p
                LEFT JOIN tasks t ON p.id = t.project_id
                WHERE p.user_id = :user_id 
                AND (p.name LIKE :search OR p.description LIKE :search)
                GROUP BY p.id
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset";
        
        $params = [
            'user_id' => $userId,
            'search' => $searchTerm,
            'limit' => $limit,
            'offset' => $offset
        ];

        return $this->db->query($sql, $params);
    }

    /**
     * Подсчитать общее количество проектов пользователя
     */
    public function countByUserId(string $userId): int
    {
        $sql = "SELECT COUNT(*) as total FROM projects WHERE user_id = :user_id";
        $result = $this->db->queryOne($sql, ['user_id' => $userId]);
        return (int) $result['total'];
    }
}

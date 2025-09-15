<?php

namespace App\Models;

use App\Database\Database;

class TaskComment
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Создать комментарий к задаче
     */
    public function create($data)
    {
        $id = $this->generateId();
        $query = "INSERT INTO task_comments (id, task_id, user_id, content) 
                  VALUES (?, ?, ?, ?)";
        
        $stmt = $this->db->getConnection()->prepare($query);
        $result = $stmt->execute([
            $id,
            $data['task_id'],
            $data['user_id'],
            $data['content']
        ]);

        if ($result) {
            return $this->findById($id);
        }

        return false;
    }

    /**
     * Найти комментарий по ID
     */
    public function findById($id)
    {
        $query = "SELECT tc.*, u.name, u.email, u.avatar 
                  FROM task_comments tc 
                  JOIN users u ON tc.user_id = u.id 
                  WHERE tc.id = ?";
        
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Получить комментарии к задаче
     */
    public function getByTaskId($taskId)
    {
        $query = "SELECT tc.*, u.name, u.email, u.avatar 
                  FROM task_comments tc 
                  JOIN users u ON tc.user_id = u.id 
                  WHERE tc.task_id = ? 
                  ORDER BY tc.created_at ASC";
        
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$taskId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Обновить комментарий
     */
    public function update($id, $content)
    {
        $query = "UPDATE task_comments SET content = ?, updated_at = datetime('now') WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$content, $id]);
    }

    /**
     * Удалить комментарий
     */
    public function delete($id)
    {
        $query = "DELETE FROM task_comments WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$id]);
    }

    /**
     * Проверить, может ли пользователь редактировать комментарий
     */
    public function canEdit($commentId, $userId)
    {
        $query = "SELECT user_id FROM task_comments WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch(\PDO::FETCH_ASSOC);

        return $comment && $comment['user_id'] === $userId;
    }

    /**
     * Генерировать уникальный ID
     */
    private function generateId()
    {
        return uniqid('comment_', true);
    }
}

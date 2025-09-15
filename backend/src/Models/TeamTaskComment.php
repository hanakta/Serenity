<?php

namespace App\Models;

use PDO;
use Exception;

class TeamTaskComment
{
    private $db;
    private $table = 'team_task_comments';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Создать новый комментарий
     */
    public function create($data)
    {
        try {
            $sql = "INSERT INTO {$this->table} (team_id, task_id, user_id, content, created_at, updated_at) 
                    VALUES (:team_id, :task_id, :user_id, :content, :created_at, :updated_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            
            $result = $stmt->execute([
                ':team_id' => $data['team_id'],
                ':task_id' => $data['task_id'],
                ':user_id' => $data['user_id'],
                ':content' => $data['content'],
                ':created_at' => $now,
                ':updated_at' => $now
            ]);

            if ($result) {
                $commentId = $this->db->lastInsertId();
                return $this->findById($commentId);
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка создания комментария: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Найти комментарий по ID
     */
    public function findById($id)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    INNER JOIN tasks t ON c.task_id = t.id
                    WHERE c.id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска комментария: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить комментарии к задаче
     */
    public function getByTaskId($taskId, $limit = 50, $offset = 0)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE c.task_id = :task_id
                    ORDER BY c.created_at ASC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':task_id', $taskId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения комментариев к задаче: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить комментарии команды
     */
    public function getByTeamId($teamId, $limit = 50, $offset = 0)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    INNER JOIN tasks t ON c.task_id = t.id
                    WHERE c.team_id = :team_id
                    ORDER BY c.created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения комментариев команды: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить комментарии пользователя в команде
     */
    public function getByUserInTeam($teamId, $userId, $limit = 20)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    INNER JOIN tasks t ON c.task_id = t.id
                    WHERE c.team_id = :team_id AND c.user_id = :user_id
                    ORDER BY c.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения комментариев пользователя: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Обновить комментарий
     */
    public function update($id, $data)
    {
        try {
            $fields = [];
            $params = [':id' => $id];
            
            if (isset($data['content'])) {
                $fields[] = 'content = :content';
                $params[':content'] = $data['content'];
            }
            
            if (empty($fields)) {
                return false;
            }
            
            $fields[] = 'updated_at = :updated_at';
            $params[':updated_at'] = date('Y-m-d H:i:s');
            
            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute($params);
            
            if ($result) {
                return $this->findById($id);
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка обновления комментария: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить комментарий
     */
    public function delete($id)
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("Ошибка удаления комментария: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить количество комментариев к задаче
     */
    public function getCountByTaskId($taskId)
    {
        try {
            $sql = "SELECT COUNT(*) as comment_count FROM {$this->table} WHERE task_id = :task_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':task_id' => $taskId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['comment_count'];
        } catch (Exception $e) {
            error_log("Ошибка получения количества комментариев: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Получить статистику комментариев команды
     */
    public function getStats($teamId, $days = 30)
    {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_comments,
                        COUNT(DISTINCT user_id) as active_users,
                        COUNT(DISTINCT task_id) as tasks_with_comments,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as comments_today,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as comments_week,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) THEN 1 END) as comments_period
                    FROM {$this->table}
                    WHERE team_id = :team_id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':days' => $days
            ]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения статистики комментариев: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Поиск комментариев
     */
    public function search($teamId, $query, $limit = 20)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    INNER JOIN tasks t ON c.task_id = t.id
                    WHERE c.team_id = :team_id 
                    AND c.content LIKE :query
                    ORDER BY c.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':query', '%' . $query . '%', PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска комментариев: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить последние комментарии команды
     */
    public function getLatest($teamId, $limit = 10)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    INNER JOIN tasks t ON c.task_id = t.id
                    WHERE c.team_id = :team_id
                    ORDER BY c.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения последних комментариев: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Проверить, может ли пользователь редактировать комментарий
     */
    public function canEdit($commentId, $userId)
    {
        try {
            $sql = "SELECT user_id FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $commentId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result && $result['user_id'] == $userId;
        } catch (Exception $e) {
            error_log("Ошибка проверки прав редактирования комментария: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверить, может ли пользователь удалить комментарий
     */
    public function canDelete($commentId, $userId, $userRole = null)
    {
        try {
            $sql = "SELECT user_id FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $commentId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Пользователь может удалить свой комментарий или админ/владелец может удалить любой
            return $result && (
                $result['user_id'] == $userId || 
                in_array($userRole, ['admin', 'owner'])
            );
        } catch (Exception $e) {
            error_log("Ошибка проверки прав удаления комментария: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить комментарии с пагинацией
     */
    public function getPaginated($teamId, $page = 1, $perPage = 20)
    {
        try {
            $offset = ($page - 1) * $perPage;
            
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, t.title as task_title
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    INNER JOIN tasks t ON c.task_id = t.id
                    WHERE c.team_id = :team_id
                    ORDER BY c.created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Получаем общее количество для пагинации
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE team_id = :team_id";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':team_id' => $teamId]);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            return [
                'comments' => $comments,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => (int)$total,
                    'total_pages' => ceil($total / $perPage)
                ]
            ];
        } catch (Exception $e) {
            error_log("Ошибка получения комментариев с пагинацией: " . $e->getMessage());
            return ['comments' => [], 'pagination' => []];
        }
    }
}

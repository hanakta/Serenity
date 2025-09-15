<?php

namespace App\Models;

use PDO;
use Exception;

class TeamChatMessage
{
    private $db;
    private $table = 'team_chat_messages';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Создать новое сообщение
     */
    public function create($data)
    {
        try {
            $messageId = 'msg_' . uniqid();
            $sql = "INSERT INTO {$this->table} (id, team_id, user_id, message, message_type, reply_to_id, is_edited, created_at, updated_at) 
                    VALUES (:id, :team_id, :user_id, :message, :message_type, :reply_to_id, :is_edited, :created_at, :updated_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            
            $result = $stmt->execute([
                ':id' => $messageId,
                ':team_id' => $data['team_id'],
                ':user_id' => $data['user_id'],
                ':message' => $data['message'],
                ':message_type' => $data['message_type'] ?? 'text',
                ':reply_to_id' => $data['reply_to_id'] ?? null,
                ':is_edited' => 0,
                ':created_at' => $now,
                ':updated_at' => $now
            ]);

            if ($result) {
                return $this->findById($messageId);
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка создания сообщения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Найти сообщение по ID
     */
    public function findById($id)
    {
        try {
            $sql = "SELECT m.*, u.name as user_name, u.avatar as user_avatar,
                           r.message as reply_message, ru.name as reply_user_name
                    FROM {$this->table} m
                    INNER JOIN users u ON m.user_id = u.id
                    LEFT JOIN {$this->table} r ON m.reply_to_id = r.id
                    LEFT JOIN users ru ON r.user_id = ru.id
                    WHERE m.id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска сообщения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить сообщения команды
     */
    public function getByTeamId($teamId, $limit = 50, $offset = 0, $userId = null)
    {
        try {
            $sql = "SELECT m.*, u.name as user_name, u.avatar as user_avatar,
                           r.message as reply_message, ru.name as reply_user_name
                    FROM {$this->table} m
                    INNER JOIN users u ON m.user_id = u.id
                    LEFT JOIN {$this->table} r ON m.reply_to_id = r.id
                    LEFT JOIN users ru ON r.user_id = ru.id
                    WHERE m.team_id = :team_id
                    ORDER BY m.created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Получаем количество непрочитанных сообщений
            $unreadCount = $userId ? $this->getUnreadCount($teamId, $userId) : 0;
            
            return [
                'messages' => array_reverse($messages), // Возвращаем в хронологическом порядке
                'unread_count' => $unreadCount
            ];
        } catch (Exception $e) {
            error_log("Ошибка получения сообщений команды: " . $e->getMessage());
            return ['messages' => [], 'unread_count' => 0];
        }
    }

    /**
     * Обновить сообщение
     */
    public function update($id, $data)
    {
        try {
            $fields = [];
            $params = [':id' => $id];
            
            if (isset($data['message'])) {
                $fields[] = 'message = :message';
                $params[':message'] = $data['message'];
            }
            
            if (isset($data['message_type'])) {
                $fields[] = 'message_type = :message_type';
                $params[':message_type'] = $data['message_type'];
            }
            
            if (empty($fields)) {
                return false;
            }
            
            $fields[] = 'is_edited = 1';
            $fields[] = 'edited_at = :edited_at';
            $fields[] = 'updated_at = :updated_at';
            $params[':edited_at'] = date('Y-m-d H:i:s');
            $params[':updated_at'] = date('Y-m-d H:i:s');
            
            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute($params);
            
            if ($result) {
                return $this->findById($id);
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка обновления сообщения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить сообщение
     */
    public function delete($id)
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("Ошибка удаления сообщения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Отметить сообщения как прочитанные
     */
    public function markAsRead($teamId, $userId, $messageIds)
    {
        try {
            if (empty($messageIds)) {
                return true;
            }
            
            $placeholders = str_repeat('?,', count($messageIds) - 1) . '?';
            $sql = "INSERT INTO team_chat_read_status (message_id, user_id, read_at) 
                    VALUES ({$placeholders}, ?, ?)
                    ON DUPLICATE KEY UPDATE read_at = VALUES(read_at)";
            
            $stmt = $this->db->prepare($sql);
            $params = array_merge($messageIds, [$userId, date('Y-m-d H:i:s')]);
            
            return $stmt->execute($params);
        } catch (Exception $e) {
            error_log("Ошибка отметки сообщений как прочитанных: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить количество непрочитанных сообщений
     */
    public function getUnreadCount($teamId, $userId)
    {
        try {
            $sql = "SELECT COUNT(*) as unread_count
                    FROM {$this->table} m
                    LEFT JOIN team_chat_read_status r ON m.id = r.message_id AND r.user_id = :user_id
                    WHERE m.team_id = :team_id 
                    AND m.user_id != :user_id
                    AND r.read_at IS NULL";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':user_id' => $userId
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['unread_count'];
        } catch (Exception $e) {
            error_log("Ошибка получения количества непрочитанных сообщений: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Получить последние сообщения команды
     */
    public function getLatestMessages($teamId, $limit = 10)
    {
        try {
            $sql = "SELECT m.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} m
                    INNER JOIN users u ON m.user_id = u.id
                    WHERE m.team_id = :team_id
                    ORDER BY m.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            error_log("Ошибка получения последних сообщений: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Поиск сообщений
     */
    public function search($teamId, $query, $limit = 20)
    {
        try {
            $sql = "SELECT m.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} m
                    INNER JOIN users u ON m.user_id = u.id
                    WHERE m.team_id = :team_id 
                    AND m.message LIKE :query
                    ORDER BY m.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':query', '%' . $query . '%', PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска сообщений: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить статистику сообщений
     */
    public function getStats($teamId, $days = 30)
    {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_messages,
                        COUNT(DISTINCT user_id) as active_users,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as messages_today,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as messages_week,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) THEN 1 END) as messages_period
                    FROM {$this->table}
                    WHERE team_id = :team_id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':days' => $days
            ]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения статистики сообщений: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверить, может ли пользователь редактировать сообщение
     */
    public function canEdit($messageId, $userId)
    {
        try {
            $sql = "SELECT user_id FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $messageId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result && $result['user_id'] == $userId;
        } catch (Exception $e) {
            error_log("Ошибка проверки прав редактирования: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверить, может ли пользователь удалить сообщение
     */
    public function canDelete($messageId, $userId, $userRole = null)
    {
        try {
            $sql = "SELECT user_id FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $messageId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Пользователь может удалить свое сообщение или админ/владелец может удалить любое
            return $result && (
                $result['user_id'] == $userId || 
                in_array($userRole, ['admin', 'owner'])
            );
        } catch (Exception $e) {
            error_log("Ошибка проверки прав удаления: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить ID текущего пользователя (заглушка)
     */
    private function getCurrentUserId()
    {
        // В реальном приложении это должно браться из сессии или JWT токена
        return $_SESSION['user_id'] ?? 1;
    }
}

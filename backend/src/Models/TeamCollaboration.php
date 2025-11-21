<?php

namespace App\Models;

use PDO;
use Exception;

class TeamCollaboration
{
    private $db;
    private $table = 'team_collaboration';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Создать запись активности
     */
    public function create($data)
    {
        try {
            $activityId = 'act_' . uniqid() . '_' . substr(bin2hex(random_bytes(4)), 0, 8);
            
            $sql = "INSERT INTO {$this->table} (id, team_id, user_id, activity_type, activity_data, target_id, target_type, created_at) 
                    VALUES (:id, :team_id, :user_id, :activity_type, :activity_data, :target_id, :target_type, :created_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            
            $jsonData = json_encode($data['activity_data'], JSON_UNESCAPED_UNICODE);
            error_log("TeamCollaboration::create - JSON data: " . $jsonData);
            
            $result = $stmt->execute([
                ':id' => $activityId,
                ':team_id' => $data['team_id'],
                ':user_id' => $data['user_id'],
                ':activity_type' => $data['activity_type'],
                ':activity_data' => $jsonData,
                ':target_id' => $data['target_id'] ?? null,
                ':target_type' => $data['target_type'] ?? null,
                ':created_at' => $now
            ]);

            error_log("TeamCollaboration::create - Execute result: " . ($result ? 'true' : 'false'));
            
            if ($result) {
                error_log("TeamCollaboration::create - About to call findById with ID: " . $activityId);
                $found = $this->findById($activityId);
                error_log("TeamCollaboration::create - findById result: " . ($found ? 'found' : 'not found'));
                return $found;
            }
            
            error_log("TeamCollaboration::create - Execute failed");
            return false;
        } catch (Exception $e) {
            error_log("Ошибка создания активности: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Найти активность по ID
     */
    public function findById($id)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE c.id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result) {
                $result['activity_data'] = json_decode($result['activity_data'], true);
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Ошибка поиска активности: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить активность команды
     */
    public function getByTeamId($teamId, $limit = 50, $offset = 0)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE c.team_id = ?
                    ORDER BY c.created_at DESC
                    LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$teamId, $limit, $offset]);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Декодируем JSON данные для каждой активности
            foreach ($activities as &$activity) {
                $activity['activity_data'] = json_decode($activity['activity_data'], true);
            }
            
            return $activities;
        } catch (Exception $e) {
            error_log("Ошибка получения активности команды: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить активность по типу
     */
    public function getByType($teamId, $activityType, $limit = 20)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE c.team_id = :team_id AND c.activity_type = :activity_type
                    ORDER BY c.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':activity_type', $activityType, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Декодируем JSON данные для каждой активности
            foreach ($activities as &$activity) {
                $activity['activity_data'] = json_decode($activity['activity_data'], true);
            }
            
            return $activities;
        } catch (Exception $e) {
            error_log("Ошибка получения активности по типу: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить активность пользователя в команде
     */
    public function getByUserInTeam($teamId, $userId, $limit = 20)
    {
        try {
            $sql = "SELECT c.*, u.name as user_name, u.avatar as user_avatar
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE c.team_id = :team_id AND c.user_id = :user_id
                    ORDER BY c.created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Декодируем JSON данные для каждой активности
            foreach ($activities as &$activity) {
                $activity['activity_data'] = json_decode($activity['activity_data'], true);
            }
            
            return $activities;
        } catch (Exception $e) {
            error_log("Ошибка получения активности пользователя: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить статистику активности
     */
    public function getStats($teamId, $days = 30)
    {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_activities,
                        COUNT(DISTINCT user_id) as active_users,
                        COUNT(CASE WHEN activity_type = 'task_created' THEN 1 END) as tasks_created,
                        COUNT(CASE WHEN activity_type = 'task_completed' THEN 1 END) as tasks_completed,
                        COUNT(CASE WHEN activity_type = 'comment_added' THEN 1 END) as comments_added,
                        COUNT(CASE WHEN activity_type = 'file_uploaded' THEN 1 END) as files_uploaded,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as activities_today,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as activities_week,
                        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) THEN 1 END) as activities_period
                    FROM {$this->table}
                    WHERE team_id = :team_id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':days' => $days
            ]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения статистики активности: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить топ активных пользователей
     */
    public function getTopActiveUsers($teamId, $limit = 10, $days = 30)
    {
        try {
            $sql = "SELECT 
                        c.user_id,
                        u.name as user_name,
                        u.avatar as user_avatar,
                        COUNT(*) as activity_count,
                        COUNT(CASE WHEN c.activity_type = 'task_created' THEN 1 END) as tasks_created,
                        COUNT(CASE WHEN c.activity_type = 'task_completed' THEN 1 END) as tasks_completed,
                        COUNT(CASE WHEN c.activity_type = 'comment_added' THEN 1 END) as comments_added
                    FROM {$this->table} c
                    INNER JOIN users u ON c.user_id = u.id
                    WHERE c.team_id = :team_id 
                    AND c.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
                    GROUP BY c.user_id, u.name, u.avatar
                    ORDER BY activity_count DESC
                    LIMIT :limit";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':days', $days, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения топ активных пользователей: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить активность за период
     */
    public function getActivityByPeriod($teamId, $startDate, $endDate)
    {
        try {
            $sql = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as activity_count,
                        COUNT(DISTINCT user_id) as active_users,
                        COUNT(CASE WHEN activity_type = 'task_created' THEN 1 END) as tasks_created,
                        COUNT(CASE WHEN activity_type = 'task_completed' THEN 1 END) as tasks_completed
                    FROM {$this->table}
                    WHERE team_id = :team_id 
                    AND created_at BETWEEN :start_date AND :end_date
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения активности за период: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Удалить старую активность
     */
    public function cleanupOldActivities($days = 90)
    {
        try {
            $sql = "DELETE FROM {$this->table} 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([':days' => $days]);
            
            return $result ? $stmt->rowCount() : 0;
        } catch (Exception $e) {
            error_log("Ошибка очистки старой активности: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Создать активность для задачи
     */
    public function createTaskActivity($teamId, $userId, $activityType, $taskData)
    {
        $activityData = [
            'task_title' => $taskData['title'] ?? '',
            'task_id' => $taskData['id'] ?? null,
            'task_status' => $taskData['status'] ?? null,
            'task_priority' => $taskData['priority'] ?? null
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'activity_data' => $activityData,
            'target_id' => $taskData['id'] ?? null,
            'target_type' => 'task'
        ]);
    }

    /**
     * Создать активность для проекта
     */
    public function createProjectActivity($teamId, $userId, $activityType, $projectData)
    {
        $activityData = [
            'project_name' => $projectData['name'] ?? '',
            'project_id' => $projectData['id'] ?? null,
            'project_color' => $projectData['color'] ?? null
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'activity_data' => $activityData,
            'target_id' => $projectData['id'] ?? null,
            'target_type' => 'project'
        ]);
    }

    /**
     * Создать активность для файла
     */
    public function createFileActivity($teamId, $userId, $activityType, $fileData)
    {
        $activityData = [
            'file_name' => $fileData['original_filename'] ?? '',
            'file_id' => $fileData['id'] ?? null,
            'file_size' => $fileData['file_size'] ?? null,
            'mime_type' => $fileData['mime_type'] ?? null
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'activity_data' => $activityData,
            'target_id' => $fileData['id'] ?? null,
            'target_type' => 'file'
        ]);
    }

    /**
     * Создать активность для комментария
     */
    public function createCommentActivity($teamId, $userId, $activityType, $commentData)
    {
        $activityData = [
            'comment_content' => $commentData['content'] ?? '',
            'comment_id' => $commentData['id'] ?? null,
            'task_title' => $commentData['task_title'] ?? null,
            'task_id' => $commentData['task_id'] ?? null
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'activity_type' => $activityType,
            'activity_data' => $activityData,
            'target_id' => $commentData['id'] ?? null,
            'target_type' => 'comment'
        ]);
    }

    /**
     * Получить уведомления команды
     */
    public function getTeamNotifications($teamId, $userId, $limit = 20, $offset = 0, $unreadOnly = false)
    {
        try {
            $sql = "SELECT n.*, u.name as user_name, u.avatar as user_avatar
                    FROM team_notifications n
                    INNER JOIN users u ON n.user_id = u.id
                    WHERE n.team_id = :team_id AND n.user_id = :user_id";
            
            if ($unreadOnly) {
                $sql .= " AND n.is_read = 0";
            }
            
            $sql .= " ORDER BY n.created_at DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_STR);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Декодируем JSON данные для каждого уведомления
            foreach ($notifications as &$notification) {
                if ($notification['data']) {
                    $notification['data'] = json_decode($notification['data'], true);
                }
            }
            
            return $notifications;
        } catch (Exception $e) {
            error_log("Ошибка получения уведомлений команды: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Отметить уведомление как прочитанное
     */
    public function markNotificationAsRead($notificationId, $userId)
    {
        try {
            $sql = "UPDATE team_notifications 
                    SET is_read = 1 
                    WHERE id = :notification_id AND user_id = :user_id";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':notification_id' => $notificationId,
                ':user_id' => $userId
            ]);
            
            return $result ? $stmt->rowCount() : 0;
        } catch (Exception $e) {
            error_log("Ошибка отметки уведомления как прочитанного: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Отметить все уведомления команды как прочитанные
     */
    public function markAllNotificationsAsRead($teamId, $userId)
    {
        try {
            $sql = "UPDATE team_notifications 
                    SET is_read = 1 
                    WHERE team_id = :team_id AND user_id = :user_id AND is_read = 0";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':team_id' => $teamId,
                ':user_id' => $userId
            ]);
            
            return $result ? $stmt->rowCount() : 0;
        } catch (Exception $e) {
            error_log("Ошибка отметки всех уведомлений как прочитанных: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Создать уведомление команды
     */
    public function createTeamNotification($teamId, $userId, $type, $title, $message, $data = null)
    {
        try {
            $sql = "INSERT INTO team_notifications (id, team_id, user_id, type, title, message, data, is_read, created_at) 
                    VALUES (:id, :team_id, :user_id, :type, :title, :message, :data, 0, :created_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            $id = uniqid('notif_', true);
            
            $result = $stmt->execute([
                ':id' => $id,
                ':team_id' => $teamId,
                ':user_id' => $userId,
                ':type' => $type,
                ':title' => $title,
                ':message' => $message,
                ':data' => $data ? json_encode($data) : null,
                ':created_at' => $now
            ]);

            return $result ? $id : false;
        } catch (Exception $e) {
            error_log("Ошибка создания уведомления команды: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Создать уведомления для всех участников команды
     */
    public function createTeamNotificationForAllMembers($teamId, $excludeUserId, $type, $title, $message, $data = null)
    {
        try {
            // Получаем всех участников команды кроме исключенного пользователя
            $sql = "SELECT user_id FROM team_members WHERE team_id = :team_id AND user_id != :exclude_user_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':exclude_user_id' => $excludeUserId
            ]);
            
            $members = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $createdCount = 0;
            
            foreach ($members as $memberId) {
                if ($this->createTeamNotification($teamId, $memberId, $type, $title, $message, $data)) {
                    $createdCount++;
                }
            }
            
            return $createdCount;
        } catch (Exception $e) {
            error_log("Ошибка создания уведомлений для всех участников: " . $e->getMessage());
            return 0;
        }
    }
}

<?php

namespace App\Services;

use PDO;
use Exception;

class TeamNotificationService
{
    private $db;
    private $table = 'team_notifications';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Создать уведомление
     */
    public function create($data)
    {
        try {
            $sql = "INSERT INTO {$this->table} (team_id, user_id, type, title, message, data, is_read, created_at) 
                    VALUES (:team_id, :user_id, :type, :title, :message, :data, :is_read, :created_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            
            $result = $stmt->execute([
                ':team_id' => $data['team_id'],
                ':user_id' => $data['user_id'],
                ':type' => $data['type'],
                ':title' => $data['title'],
                ':message' => $data['message'],
                ':data' => json_encode($data['data'] ?? []),
                ':is_read' => 0,
                ':created_at' => $now
            ]);

            if ($result) {
                return $this->db->lastInsertId();
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка создания уведомления: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить уведомления пользователя в команде
     */
    public function getByUserInTeam($teamId, $userId, $limit = 50, $offset = 0)
    {
        try {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE team_id = :team_id AND user_id = :user_id
                    ORDER BY created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':team_id', $teamId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Декодируем JSON данные для каждого уведомления
            foreach ($notifications as &$notification) {
                $notification['data'] = json_decode($notification['data'], true);
            }
            
            return $notifications;
        } catch (Exception $e) {
            error_log("Ошибка получения уведомлений: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить все уведомления пользователя
     */
    public function getByUser($userId, $limit = 50, $offset = 0)
    {
        try {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE user_id = :user_id
                    ORDER BY created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Декодируем JSON данные для каждого уведомления
            foreach ($notifications as &$notification) {
                $notification['data'] = json_decode($notification['data'], true);
            }
            
            return $notifications;
        } catch (Exception $e) {
            error_log("Ошибка получения уведомлений пользователя: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Отметить уведомление как прочитанное
     */
    public function markAsRead($notificationId, $userId)
    {
        try {
            $sql = "UPDATE {$this->table} SET is_read = 1 WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':id' => $notificationId,
                ':user_id' => $userId
            ]);
        } catch (Exception $e) {
            error_log("Ошибка отметки уведомления как прочитанного: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Отметить все уведомления команды как прочитанные
     */
    public function markAllAsReadInTeam($teamId, $userId)
    {
        try {
            $sql = "UPDATE {$this->table} SET is_read = 1 
                    WHERE team_id = :team_id AND user_id = :user_id AND is_read = 0";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':team_id' => $teamId,
                ':user_id' => $userId
            ]);
        } catch (Exception $e) {
            error_log("Ошибка отметки всех уведомлений как прочитанных: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Отметить все уведомления пользователя как прочитанные
     */
    public function markAllAsRead($userId)
    {
        try {
            $sql = "UPDATE {$this->table} SET is_read = 1 WHERE user_id = :user_id AND is_read = 0";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':user_id' => $userId]);
        } catch (Exception $e) {
            error_log("Ошибка отметки всех уведомлений как прочитанных: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить уведомление
     */
    public function delete($notificationId, $userId)
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':id' => $notificationId,
                ':user_id' => $userId
            ]);
        } catch (Exception $e) {
            error_log("Ошибка удаления уведомления: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить количество непрочитанных уведомлений
     */
    public function getUnreadCount($userId, $teamId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as unread_count FROM {$this->table} 
                    WHERE user_id = :user_id AND is_read = 0";
            $params = [':user_id' => $userId];
            
            if ($teamId) {
                $sql .= " AND team_id = :team_id";
                $params[':team_id'] = $teamId;
            }
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['unread_count'];
        } catch (Exception $e) {
            error_log("Ошибка получения количества непрочитанных уведомлений: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Создать уведомление о новой задаче
     */
    public function createTaskNotification($teamId, $userId, $taskData, $notificationType = 'task_created')
    {
        $titles = [
            'task_created' => 'Новая задача',
            'task_updated' => 'Задача обновлена',
            'task_completed' => 'Задача завершена',
            'task_assigned' => 'Задача назначена'
        ];

        $messages = [
            'task_created' => "Создана новая задача: {$taskData['title']}",
            'task_updated' => "Задача обновлена: {$taskData['title']}",
            'task_completed' => "Задача завершена: {$taskData['title']}",
            'task_assigned' => "Вам назначена задача: {$taskData['title']}"
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'type' => $notificationType,
            'title' => $titles[$notificationType] ?? 'Уведомление о задаче',
            'message' => $messages[$notificationType] ?? 'Изменения в задаче',
            'data' => [
                'task_id' => $taskData['id'] ?? null,
                'task_title' => $taskData['title'] ?? '',
                'task_status' => $taskData['status'] ?? null,
                'task_priority' => $taskData['priority'] ?? null
            ]
        ]);
    }

    /**
     * Создать уведомление о новом проекте
     */
    public function createProjectNotification($teamId, $userId, $projectData, $notificationType = 'project_created')
    {
        $titles = [
            'project_created' => 'Новый проект',
            'project_updated' => 'Проект обновлен',
            'project_deleted' => 'Проект удален'
        ];

        $messages = [
            'project_created' => "Создан новый проект: {$projectData['name']}",
            'project_updated' => "Проект обновлен: {$projectData['name']}",
            'project_deleted' => "Проект удален: {$projectData['name']}"
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'type' => $notificationType,
            'title' => $titles[$notificationType] ?? 'Уведомление о проекте',
            'message' => $messages[$notificationType] ?? 'Изменения в проекте',
            'data' => [
                'project_id' => $projectData['id'] ?? null,
                'project_name' => $projectData['name'] ?? '',
                'project_color' => $projectData['color'] ?? null
            ]
        ]);
    }

    /**
     * Создать уведомление о новом сообщении
     */
    public function createMessageNotification($teamId, $userId, $messageData, $notificationType = 'message_received')
    {
        $titles = [
            'message_received' => 'Новое сообщение',
            'message_mentioned' => 'Вас упомянули'
        ];

        $messages = [
            'message_received' => "Новое сообщение в чате команды",
            'message_mentioned' => "Вас упомянули в сообщении"
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'type' => $notificationType,
            'title' => $titles[$notificationType] ?? 'Уведомление о сообщении',
            'message' => $messages[$notificationType] ?? 'Новое сообщение',
            'data' => [
                'message_id' => $messageData['id'] ?? null,
                'message_preview' => substr($messageData['message'] ?? '', 0, 100),
                'sender_name' => $messageData['user_name'] ?? ''
            ]
        ]);
    }

    /**
     * Создать уведомление о файле
     */
    public function createFileNotification($teamId, $userId, $fileData, $notificationType = 'file_uploaded')
    {
        $titles = [
            'file_uploaded' => 'Новый файл',
            'file_downloaded' => 'Файл скачан',
            'file_deleted' => 'Файл удален'
        ];

        $messages = [
            'file_uploaded' => "Загружен новый файл: {$fileData['original_filename']}",
            'file_downloaded' => "Файл скачан: {$fileData['original_filename']}",
            'file_deleted' => "Файл удален: {$fileData['original_filename']}"
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'type' => $notificationType,
            'title' => $titles[$notificationType] ?? 'Уведомление о файле',
            'message' => $messages[$notificationType] ?? 'Изменения в файле',
            'data' => [
                'file_id' => $fileData['id'] ?? null,
                'file_name' => $fileData['original_filename'] ?? '',
                'file_size' => $fileData['file_size'] ?? null,
                'mime_type' => $fileData['mime_type'] ?? null
            ]
        ]);
    }

    /**
     * Создать уведомление о команде
     */
    public function createTeamNotification($teamId, $userId, $teamData, $notificationType = 'team_joined')
    {
        $titles = [
            'team_joined' => 'Присоединение к команде',
            'team_left' => 'Покидание команды',
            'team_updated' => 'Команда обновлена',
            'member_added' => 'Новый участник',
            'member_removed' => 'Участник удален',
            'role_changed' => 'Изменение роли'
        ];

        $messages = [
            'team_joined' => "Вы присоединились к команде: {$teamData['name']}",
            'team_left' => "Вы покинули команду: {$teamData['name']}",
            'team_updated' => "Команда обновлена: {$teamData['name']}",
            'member_added' => "Новый участник добавлен в команду: {$teamData['name']}",
            'member_removed' => "Участник удален из команды: {$teamData['name']}",
            'role_changed' => "Ваша роль в команде изменена: {$teamData['name']}"
        ];

        return $this->create([
            'team_id' => $teamId,
            'user_id' => $userId,
            'type' => $notificationType,
            'title' => $titles[$notificationType] ?? 'Уведомление о команде',
            'message' => $messages[$notificationType] ?? 'Изменения в команде',
            'data' => [
                'team_id' => $teamId,
                'team_name' => $teamData['name'] ?? '',
                'team_color' => $teamData['color'] ?? null,
                'role' => $teamData['role'] ?? null
            ]
        ]);
    }

    /**
     * Отправить уведомление всем участникам команды
     */
    public function notifyAllTeamMembers($teamId, $notificationData, $excludeUserId = null)
    {
        try {
            // Получаем всех участников команды
            $sql = "SELECT user_id FROM team_members WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            $members = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $results = [];
            foreach ($members as $userId) {
                if ($excludeUserId && $userId == $excludeUserId) {
                    continue;
                }

                $notificationData['user_id'] = $userId;
                $results[] = $this->create($notificationData);
            }

            return $results;
        } catch (Exception $e) {
            error_log("Ошибка отправки уведомлений всем участникам: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Очистить старые уведомления
     */
    public function cleanupOldNotifications($days = 30)
    {
        try {
            $sql = "DELETE FROM {$this->table} 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY) 
                    AND is_read = 1";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([':days' => $days]);
            
            return $result ? $stmt->rowCount() : 0;
        } catch (Exception $e) {
            error_log("Ошибка очистки старых уведомлений: " . $e->getMessage());
            return 0;
        }
    }
}

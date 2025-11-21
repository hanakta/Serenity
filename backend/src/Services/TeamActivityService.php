<?php

namespace App\Services;

use App\Models\TeamCollaboration;
use App\Models\Team;
use App\Database\Database;

class TeamActivityService
{
    private $collaborationModel;
    private $teamModel;
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->collaborationModel = new TeamCollaboration($this->db->getConnection());
        $this->teamModel = new Team($this->db->getConnection());
    }

    /**
     * Создать активность при создании задачи
     */
    public function createTaskCreatedActivity($taskId, $userId, $teamId, $taskData)
    {
        try {
            // Проверяем, что задача принадлежит команде
            if (!$teamId) {
                return false;
            }

            // Проверяем, что пользователь является участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return false;
            }

            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => 'task_created',
                'activity_data' => [
                    'task_title' => $taskData['title'],
                    'task_description' => $taskData['description'] ?? '',
                    'task_priority' => $taskData['priority'] ?? 'medium',
                    'task_status' => $taskData['status'] ?? 'todo',
                    'due_date' => $taskData['due_date'] ?? null
                ],
                'target_id' => $taskId,
                'target_type' => 'task'
            ];

            return $this->collaborationModel->create($activityData);
        } catch (\Exception $e) {
            error_log("Ошибка создания активности task_created: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Создать активность при обновлении задачи
     */
    public function createTaskUpdatedActivity($taskId, $userId, $teamId, $oldData, $newData)
    {
        try {
            if (!$teamId) {
                return false;
            }

            if (!$this->teamModel->isMember($teamId, $userId)) {
                return false;
            }

            $changes = [];
            
            // Определяем изменения
            if ($oldData['title'] !== $newData['title']) {
                $changes['title'] = ['old' => $oldData['title'], 'new' => $newData['title']];
            }
            
            if ($oldData['status'] !== $newData['status']) {
                $changes['status'] = ['old' => $oldData['status'], 'new' => $newData['status']];
            }
            
            if ($oldData['priority'] !== $newData['priority']) {
                $changes['priority'] = ['old' => $oldData['priority'], 'new' => $newData['priority']];
            }

            if (empty($changes)) {
                return false; // Нет изменений
            }

            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => 'task_updated',
                'activity_data' => [
                    'task_title' => $newData['title'],
                    'changes' => $changes
                ],
                'target_id' => $taskId,
                'target_type' => 'task'
            ];

            return $this->collaborationModel->create($activityData);
        } catch (\Exception $e) {
            error_log("Ошибка создания активности task_updated: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Создать активность при завершении задачи
     */
    public function createTaskCompletedActivity($taskId, $userId, $teamId, $taskData)
    {
        try {
            if (!$teamId) {
                return false;
            }

            if (!$this->teamModel->isMember($teamId, $userId)) {
                return false;
            }

            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => 'task_completed',
                'activity_data' => [
                    'task_title' => $taskData['title'],
                    'completion_time' => date('Y-m-d H:i:s')
                ],
                'target_id' => $taskId,
                'target_type' => 'task'
            ];

            return $this->collaborationModel->create($activityData);
        } catch (\Exception $e) {
            error_log("Ошибка создания активности task_completed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Создать активность при создании проекта
     */
    public function createProjectCreatedActivity($projectId, $userId, $teamId, $projectData)
    {
        try {
            if (!$teamId) {
                return false;
            }

            if (!$this->teamModel->isMember($teamId, $userId)) {
                return false;
            }

            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => 'project_created',
                'activity_data' => [
                    'project_name' => $projectData['name'],
                    'project_description' => $projectData['description'] ?? ''
                ],
                'target_id' => $projectId,
                'target_type' => 'project'
            ];

            return $this->collaborationModel->create($activityData);
        } catch (\Exception $e) {
            error_log("Ошибка создания активности project_created: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Создать активность при отправке сообщения
     */
    public function createMessageSentActivity($messageId, $userId, $teamId, $messageData)
    {
        try {
            if (!$teamId) {
                return false;
            }

            if (!$this->teamModel->isMember($teamId, $userId)) {
                return false;
            }

            error_log("TeamActivityService::createMessageSentActivity - messageData: " . json_encode($messageData));
            
            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => 'message_sent',
                'activity_data' => [
                    'message_preview' => mb_substr($messageData['message'], 0, 100, 'UTF-8'),
                    'message_type' => $messageData['message_type'] ?? 'text'
                ],
                'target_id' => $messageId,
                'target_type' => 'message'
            ];
            
            error_log("TeamActivityService::createMessageSentActivity - activityData: " . json_encode($activityData, JSON_UNESCAPED_UNICODE));

            return $this->collaborationModel->create($activityData);
        } catch (\Exception $e) {
            error_log("Ошибка создания активности message_sent: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Создать активность при присоединении к команде
     */
    public function createMemberJoinedActivity($userId, $teamId, $userData)
    {
        try {
            if (!$teamId) {
                return false;
            }

            $activityData = [
                'team_id' => $teamId,
                'user_id' => $userId,
                'activity_type' => 'member_joined',
                'activity_data' => [
                    'user_name' => $userData['name'] ?? 'Пользователь',
                    'user_email' => $userData['email'] ?? ''
                ],
                'target_id' => $userId,
                'target_type' => 'user'
            ];

            return $this->collaborationModel->create($activityData);
        } catch (\Exception $e) {
            error_log("Ошибка создания активности member_joined: " . $e->getMessage());
            return false;
        }
    }
}

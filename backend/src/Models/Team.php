<?php

namespace App\Models;

use PDO;
use Exception;

class Team
{
    private $db;
    private $table = 'teams';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Создать новую команду
     */
    public function create($data)
    {
        try {
            $teamId = 'team_' . uniqid();
            $sql = "INSERT INTO {$this->table} (id, name, description, color, owner_id, created_at, updated_at) 
                    VALUES (:id, :name, :description, :color, :owner_id, :created_at, :updated_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            
            $result = $stmt->execute([
                ':id' => $teamId,
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':color' => $data['color'] ?? '#3B82F6',
                ':owner_id' => $data['owner_id'],
                ':created_at' => $now,
                ':updated_at' => $now
            ]);

            if ($result) {
                // Автоматически добавляем создателя как администратора команды
                $this->addMember($teamId, $data['owner_id'], 'admin');
                
                return $this->findById($teamId);
        }

        return false;
        } catch (Exception $e) {
            error_log("Ошибка создания команды: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Найти команду по ID
     */
    public function findById($id)
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска команды: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить все команды пользователя
     */
    public function getByUserId($userId)
    {
        try {
            $sql = "SELECT t.*, 
                           tm.role,
                           tm.joined_at,
                           COUNT(DISTINCT tm2.user_id) as member_count,
                           COUNT(DISTINCT p.id) as project_count,
                           CASE WHEN tm.role = 'owner' THEN 1 ELSE 0 END as is_owner,
                           1 as is_member
                    FROM {$this->table} t
                    INNER JOIN team_members tm ON t.id = tm.team_id
                    LEFT JOIN team_members tm2 ON t.id = tm2.team_id
                    LEFT JOIN projects p ON t.id = p.team_id
                    WHERE tm.user_id = :user_id
                    GROUP BY t.id, tm.role, tm.joined_at
                  ORDER BY tm.joined_at DESC";
        
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_STR);
            $result = $stmt->execute();
            
            if (!$result) {
                $errorInfo = $stmt->errorInfo();
                error_log("Team::getByUserId - SQL Error: " . implode(', ', $errorInfo));
            }
            
            $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return $teams;
        } catch (Exception $e) {
            error_log("Ошибка получения команд пользователя: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить все публичные команды (доступно всем пользователям)
     */
    public function getPublicTeams($limit = 20, $offset = 0, $search = '')
    {
        try {
            $whereClause = '';
            $params = [];
            
            if (!empty($search)) {
                $whereClause = "WHERE t.name LIKE :search OR t.description LIKE :search";
                $params[':search'] = "%{$search}%";
            }
            
            $sql = "SELECT t.*, 
                           COUNT(DISTINCT tm.user_id) as member_count,
                           COUNT(DISTINCT p.id) as project_count,
                           COUNT(DISTINCT task.id) as task_count,
                           u.name as owner_name,
                           u.email as owner_email,
                           u.avatar as owner_avatar,
                           t.created_at as team_created_at
                    FROM {$this->table} t
                    LEFT JOIN team_members tm ON t.id = tm.team_id
                    LEFT JOIN projects p ON t.id = p.team_id
                    LEFT JOIN tasks task ON t.id = task.team_id
                    LEFT JOIN users u ON t.owner_id = u.id
                    {$whereClause}
                    GROUP BY t.id, u.name, u.email, u.avatar
                    ORDER BY t.created_at DESC
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($sql);
            
            // Добавляем параметры
            $params[':limit'] = (int)$limit;
            $params[':offset'] = (int)$offset;
            
            $stmt->execute($params);
            
            $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Добавляем информацию о том, является ли команда активной
            foreach ($teams as &$team) {
                $team['is_active'] = $team['member_count'] > 0;
                $team['member_count'] = (int)$team['member_count'];
                $team['project_count'] = (int)$team['project_count'];
                $team['task_count'] = (int)$team['task_count'];
            }
            
            return $teams;
        } catch (Exception $e) {
            error_log("Ошибка получения публичных команд: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Обновить команду
     */
    public function update($id, $data)
    {
        try {
        $fields = [];
            $params = [':id' => $id];
            
            if (isset($data['name'])) {
                $fields[] = 'name = :name';
                $params[':name'] = $data['name'];
            }
            
            if (isset($data['description'])) {
                $fields[] = 'description = :description';
                $params[':description'] = $data['description'];
            }
            
            if (isset($data['color'])) {
                $fields[] = 'color = :color';
                $params[':color'] = $data['color'];
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
            error_log("Ошибка обновления команды: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить команду
     */
    public function delete($id)
    {
        try {
            // Начинаем транзакцию
            $this->db->beginTransaction();
            
            // Удаляем связанные данные
            $this->deleteRelatedData($id);
            
            // Удаляем саму команду
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([':id' => $id]);
            
            if ($result) {
                $this->db->commit();
                return true;
            } else {
                $this->db->rollBack();
                return false;
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Ошибка удаления команды: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Добавить участника в команду
     */
    public function addMember($teamId, $userId, $role = 'member')
    {
        try {
            $sql = "INSERT INTO team_members (id, team_id, user_id, role, joined_at) 
                    VALUES (:id, :team_id, :user_id, :role, :joined_at)";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':id' => 'member_' . uniqid(),
                ':team_id' => $teamId,
                ':user_id' => $userId,
                ':role' => $role,
                ':joined_at' => date('Y-m-d H:i:s')
            ]);
            
            return $result;
        } catch (Exception $e) {
            error_log("Ошибка добавления участника: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить участника из команды
     */
    public function removeMember($teamId, $userId)
    {
        try {
            $sql = "DELETE FROM team_members WHERE team_id = :team_id AND user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':team_id' => $teamId,
                ':user_id' => $userId
            ]);
        } catch (Exception $e) {
            error_log("Ошибка удаления участника: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Обновить роль участника
     */
    public function updateMemberRole($teamId, $userId, $role)
    {
        try {
            $sql = "UPDATE team_members SET role = :role WHERE team_id = :team_id AND user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':role' => $role,
                ':team_id' => $teamId,
                ':user_id' => $userId
            ]);
        } catch (Exception $e) {
            error_log("Ошибка обновления роли участника: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить участников команды
     */
    public function getMembers($teamId)
    {
        try {
            $sql = "SELECT tm.*, u.name as user_name, u.email, u.avatar
                    FROM team_members tm
                    INNER JOIN users u ON tm.user_id = u.id
                    WHERE tm.team_id = :team_id
                    ORDER BY tm.joined_at ASC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения участников команды: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Проверить, является ли пользователь участником команды
     */
    public function isMember($teamId, $userId)
    {
        try {
            $sql = "SELECT role FROM team_members WHERE team_id = :team_id AND user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':team_id' => $teamId,
                ':user_id' => $userId
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['role'] : false;
        } catch (Exception $e) {
            error_log("Ошибка проверки участника: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверить, является ли пользователь владельцем команды
     */
    public function isOwner($teamId, $userId)
    {
        $role = $this->isMember($teamId, $userId);
        return $role === 'owner';
    }

    /**
     * Получить статистику команды
     */
    public function getStats($teamId)
    {
        try {
            $sql = "SELECT 
                        COUNT(DISTINCT t.id) as total_tasks,
                        COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as pending_tasks,
                        COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
                        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                        COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN t.id END) as overdue_tasks,
                        COUNT(DISTINCT p.id) as total_projects,
                        COUNT(DISTINCT CASE WHEN p.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN p.id END) as active_projects,
                        COUNT(DISTINCT tm.user_id) as total_members,
                        COUNT(DISTINCT CASE WHEN tm.joined_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN tm.user_id END) as active_members
                    FROM teams team
                    LEFT JOIN tasks t ON team.id = t.team_id
                    LEFT JOIN projects p ON team.id = p.team_id
                    LEFT JOIN team_members tm ON team.id = tm.team_id
                    WHERE team.id = :team_id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'tasks' => [
                    'total' => (int)$result['total_tasks'],
                    'pending' => (int)$result['pending_tasks'],
                    'in_progress' => (int)$result['in_progress_tasks'],
                    'completed' => (int)$result['completed_tasks'],
                    'overdue' => (int)$result['overdue_tasks']
                ],
                'projects' => [
                    'total' => (int)$result['total_projects'],
                    'active' => (int)$result['active_projects']
                ],
                'members' => [
                    'total' => (int)$result['total_members'],
                    'active' => (int)$result['active_members']
                ]
            ];
        } catch (Exception $e) {
            error_log("Ошибка получения статистики команды: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить связанные данные команды
     */
    private function deleteRelatedData($teamId)
    {
        try {
            // Удаляем участников команды
            $sql = "DELETE FROM team_members WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Удаляем сообщения чата
            $sql = "DELETE FROM team_chat_messages WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Удаляем статусы прочтения
            $sql = "DELETE FROM team_chat_read_status WHERE message_id IN (
                        SELECT id FROM team_chat_messages WHERE team_id = :team_id
                    )";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Удаляем файлы команды
            $sql = "DELETE FROM team_files WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Удаляем уведомления
            $sql = "DELETE FROM team_notifications WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Удаляем активность
            $sql = "DELETE FROM team_collaboration WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Удаляем комментарии к задачам
            $sql = "DELETE FROM team_task_comments WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Обновляем задачи (убираем team_id)
            $sql = "UPDATE tasks SET team_id = NULL WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
            // Обновляем проекты (убираем team_id)
            $sql = "UPDATE projects SET team_id = NULL WHERE team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            
        } catch (Exception $e) {
            error_log("Ошибка удаления связанных данных: " . $e->getMessage());
            throw $e;
        }
    }
}

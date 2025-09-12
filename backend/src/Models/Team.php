<?php

namespace App\Models;

use App\Database\Database;

class Team
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Создать новую команду
     */
    public function create($data)
    {
        $id = $this->generateId();
        $query = "INSERT INTO teams (id, name, description, color, owner_id) 
                  VALUES (?, ?, ?, ?, ?)";
        
        $result = $this->db->execute($query, [
            $id,
            $data['name'],
            $data['description'] ?? null,
            $data['color'] ?? '#3B82F6',
            $data['owner_id']
        ]);

        if ($result > 0) {
            // Добавляем владельца как участника команды
            $this->addMember($id, $data['owner_id'], 'admin');
            return $this->findById($id);
        }

        return false;
    }

    /**
     * Найти команду по ID
     */
    public function findById($id)
    {
        $query = "SELECT * FROM teams WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Получить команды пользователя
     */
    public function getUserTeams($userId)
    {
        $query = "SELECT t.*, tm.role, tm.joined_at 
                  FROM teams t 
                  JOIN team_members tm ON t.id = tm.team_id 
                  WHERE tm.user_id = ? 
                  ORDER BY tm.joined_at DESC";
        
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Обновить команду
     */
    public function update($id, $data)
    {
        $fields = [];
        $values = [];

        foreach ($data as $key => $value) {
            if ($key === 'settings' && is_array($value)) {
                $value = json_encode($value);
            }
            $fields[] = "$key = ?";
            $values[] = $value;
        }

        $values[] = $id;
        $query = "UPDATE teams SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute($values);
    }

    /**
     * Удалить команду
     */
    public function delete($id)
    {
        $query = "DELETE FROM teams WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$id]);
    }

    /**
     * Добавить участника в команду
     */
    public function addMember($teamId, $userId, $role = 'member', $invitedBy = null)
    {
        $id = $this->generateId();
        $query = "INSERT INTO team_members (id, team_id, user_id, role) 
                  VALUES (?, ?, ?, ?)";
        
        return $this->db->execute($query, [$id, $teamId, $userId, $role]);
    }

    /**
     * Получить участников команды
     */
    public function getMembers($teamId)
    {
        $query = "SELECT tm.*, u.name, u.email, u.avatar 
                  FROM team_members tm 
                  JOIN users u ON tm.user_id = u.id 
                  WHERE tm.team_id = ? 
                  ORDER BY tm.role, tm.joined_at";
        
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$teamId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Удалить участника из команды
     */
    public function removeMember($teamId, $userId)
    {
        $query = "DELETE FROM team_members WHERE team_id = ? AND user_id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$teamId, $userId]);
    }

    /**
     * Обновить роль участника
     */
    public function updateMemberRole($teamId, $userId, $role)
    {
        $query = "UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$role, $teamId, $userId]);
    }

    /**
     * Проверить, является ли пользователь участником команды
     */
    public function isMember($teamId, $userId)
    {
        $query = "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$teamId, $userId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ? $result['role'] : false;
    }

    /**
     * Проверить права доступа
     */
    public function hasPermission($teamId, $userId, $permission)
    {
        $role = $this->isMember($teamId, $userId);
        if (!$role) return false;

        $permissions = [
            'owner' => ['read', 'write', 'delete', 'manage_members', 'manage_settings'],
            'admin' => ['read', 'write', 'delete', 'manage_members'],
            'member' => ['read', 'write'],
            'viewer' => ['read']
        ];

        return in_array($permission, $permissions[$role] ?? []);
    }

    /**
     * Создать приглашение в команду
     */
    public function createInvitation($teamId, $email, $role, $invitedBy)
    {
        $id = $this->generateId();
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        $query = "INSERT INTO team_invitations (id, team_id, email, role, token, invited_by, expires_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->getConnection()->prepare($query);
        $result = $stmt->execute([$id, $teamId, $email, $role, $token, $invitedBy, $expiresAt]);

        if ($result) {
            return [
                'id' => $id,
                'token' => $token,
                'expires_at' => $expiresAt
            ];
        }

        return false;
    }

    /**
     * Принять приглашение
     */
    public function acceptInvitation($token, $userId)
    {
        // Находим приглашение
        $query = "SELECT * FROM team_invitations WHERE token = ? AND status = 'pending' AND expires_at > NOW()";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$token]);
        $invitation = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$invitation) {
            return false;
        }

        // Проверяем, что пользователь с таким email существует
        $userQuery = "SELECT id FROM users WHERE email = ?";
        $userStmt = $this->db->prepare($userQuery);
        $userStmt->execute([$invitation['email']]);
        $user = $userStmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || $user['id'] !== $userId) {
            return false;
        }

        // Добавляем пользователя в команду
        $this->addMember($invitation['team_id'], $userId, $invitation['role'], $invitation['invited_by']);

        // Обновляем статус приглашения
        $updateQuery = "UPDATE team_invitations SET status = 'accepted', accepted_at = NOW() WHERE id = ?";
        $updateStmt = $this->db->prepare($updateQuery);
        $updateStmt->execute([$invitation['id']]);

        return true;
    }

    /**
     * Генерировать уникальный ID
     */
    private function generateId()
    {
        return uniqid('team_', true);
    }
}

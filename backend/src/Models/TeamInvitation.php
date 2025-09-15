<?php

namespace App\Models;

use PDO;
use Exception;

class TeamInvitation
{
    private $db;
    private $table = 'team_invitations';

    public function __construct($database)
    {
        $this->db = $database;
    }

    /**
     * Создать приглашение
     */
    public function create($data)
    {
        try {
            $invitationId = 'inv_' . uniqid();
            $token = bin2hex(random_bytes(32));
            
            error_log("Создание приглашения в модели с данными: " . json_encode($data));
            
            $sql = "INSERT INTO {$this->table} (id, team_id, email, role, token, invited_by, status, expires_at, created_at) 
                    VALUES (:id, :team_id, :email, :role, :token, :invited_by, :status, :expires_at, :created_at)";
            
            $stmt = $this->db->prepare($sql);
            $now = date('Y-m-d H:i:s');
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days')); // Приглашение действует 7 дней
            
            $params = [
                ':id' => $invitationId,
                ':team_id' => $data['team_id'],
                ':email' => $data['email'],
                ':role' => $data['role'] ?? 'member',
                ':token' => $token,
                ':invited_by' => $data['invited_by'],
                ':status' => 'pending',
                ':expires_at' => $expiresAt,
                ':created_at' => $now
            ];
            
            error_log("Параметры для SQL: " . json_encode($params));
            
            $result = $stmt->execute($params);
            
            error_log("Результат выполнения SQL: " . ($result ? 'true' : 'false'));

            if ($result) {
                return $this->findById($invitationId);
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка создания приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Найти приглашение по ID
     */
    public function findById($id)
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Найти приглашение по токену
     */
    public function findByToken($token)
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE token = :token AND status = 'pending' AND expires_at > NOW()";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':token' => $token]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка поиска приглашения по токену: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить приглашения команды
     */
    public function getByTeamId($teamId)
    {
        try {
            $sql = "SELECT ti.*, u.name as invited_by_name, u.email as invited_by_email 
                    FROM {$this->table} ti 
                    LEFT JOIN users u ON ti.invited_by = u.id 
                    WHERE ti.team_id = :team_id 
                    ORDER BY ti.created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения приглашений команды: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить приглашения пользователя по email
     */
    public function getByEmail($email)
    {
        try {
            $sql = "SELECT ti.*, t.name as team_name, t.description as team_description, t.color as team_color,
                           u.name as invited_by_name 
                    FROM {$this->table} ti 
                    LEFT JOIN teams t ON ti.team_id = t.id 
                    LEFT JOIN users u ON ti.invited_by = u.id 
                    WHERE ti.email = :email AND ti.status = 'pending' AND ti.expires_at > NOW()
                    ORDER BY ti.created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':email' => $email]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Ошибка получения приглашений пользователя: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Принять приглашение
     */
    public function accept($token, $userId)
    {
        try {
            $invitation = $this->findByToken($token);
            if (!$invitation) {
                return false;
            }

            $sql = "UPDATE {$this->table} SET status = 'accepted', accepted_at = NOW() WHERE token = :token";
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([':token' => $token]);

            if ($result) {
                // Добавляем пользователя в команду
                $teamModel = new Team($this->db);
                $teamModel->addMember($invitation['team_id'], $userId, $invitation['role']);
                
                return $invitation;
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Ошибка принятия приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Отклонить приглашение
     */
    public function decline($token)
    {
        try {
            $sql = "UPDATE {$this->table} SET status = 'declined' WHERE token = :token";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':token' => $token]);
        } catch (Exception $e) {
            error_log("Ошибка отклонения приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Отменить приглашение
     */
    public function cancel($id)
    {
        try {
            $sql = "UPDATE {$this->table} SET status = 'cancelled' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("Ошибка отмены приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Удалить приглашение
     */
    public function delete($id)
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("Ошибка удаления приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверить, существует ли приглашение для email в команде
     */
    public function existsForEmail($teamId, $email)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                    WHERE team_id = :team_id AND email = :email AND status = 'pending' AND expires_at > NOW()";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':team_id' => $teamId, ':email' => $email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (Exception $e) {
            error_log("Ошибка проверки существования приглашения: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Очистить просроченные приглашения
     */
    public function cleanExpired()
    {
        try {
            $sql = "UPDATE {$this->table} SET status = 'expired' WHERE expires_at < NOW() AND status = 'pending'";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Ошибка очистки просроченных приглашений: " . $e->getMessage());
            return false;
        }
    }
}

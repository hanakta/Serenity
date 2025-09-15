<?php
// 🐱 Модель пользователя для Serenity

namespace App\Models;

use App\Database\Database;
use PDO;

class User
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Создать нового пользователя
     */
    public function create(array $data): array
    {
        $sql = "INSERT INTO users (id, email, name, password_hash, avatar, avatar_data, avatar_mime_type, avatar_size, settings) 
                VALUES (:id, :email, :name, :password_hash, :avatar, :avatar_data, :avatar_mime_type, :avatar_size, :settings)";
        
        $params = [
            'id' => uniqid('user_', true),
            'email' => $data['email'],
            'name' => $data['name'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'avatar' => $data['avatar'] ?? null,
            'avatar_data' => $data['avatar_data'] ?? null,
            'avatar_mime_type' => $data['avatar_mime_type'] ?? null,
            'avatar_size' => $data['avatar_size'] ?? null,
            'settings' => json_encode($data['settings'] ?? [])
        ];

        $this->db->execute($sql, $params);
        $userId = $params['id'];

        return $this->findById($userId);
    }

    /**
     * Найти пользователя по ID
     */
    public function findById(string $id): ?array
    {
        $sql = "SELECT id, email, name, avatar, avatar_data, avatar_mime_type, avatar_size, settings, email_verified_at, created_at, updated_at 
                FROM users WHERE id = :id";
        
        return $this->db->queryOne($sql, ['id' => $id]);
    }

    /**
     * Найти пользователя по email
     */
    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT id, email, name, avatar, avatar_data, avatar_mime_type, avatar_size, settings, email_verified_at, created_at, updated_at 
                FROM users WHERE email = :email";
        
        return $this->db->queryOne($sql, ['email' => $email]);
    }

    /**
     * Найти пользователя по email с паролем (для аутентификации)
     */
    public function findByEmailWithPassword(string $email): ?array
    {
        $sql = "SELECT id, email, name, password_hash, avatar, avatar_data, avatar_mime_type, avatar_size, settings, email_verified_at, created_at, updated_at 
                FROM users WHERE email = :email";
        
        return $this->db->queryOne($sql, ['email' => $email]);
    }

    /**
     * Обновить пользователя
     */
    public function update(string $id, array $data): ?array
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params['name'] = $data['name'];
        }

        if (isset($data['email'])) {
            $fields[] = 'email = :email';
            $params['email'] = $data['email'];
        }

        if (isset($data['avatar'])) {
            $fields[] = 'avatar = :avatar';
            $params['avatar'] = $data['avatar'];
        }

        if (isset($data['avatar_data'])) {
            $fields[] = 'avatar_data = :avatar_data';
            $params['avatar_data'] = $data['avatar_data'];
        }

        if (isset($data['avatar_mime_type'])) {
            $fields[] = 'avatar_mime_type = :avatar_mime_type';
            $params['avatar_mime_type'] = $data['avatar_mime_type'];
        }

        if (isset($data['avatar_size'])) {
            $fields[] = 'avatar_size = :avatar_size';
            $params['avatar_size'] = $data['avatar_size'];
        }

        if (isset($data['settings'])) {
            $fields[] = 'settings = :settings';
            $params['settings'] = json_encode($data['settings']);
        }

        if (isset($data['password'])) {
            $fields[] = 'password_hash = :password_hash';
            $params['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        if (isset($data['password_hash'])) {
            $fields[] = 'password_hash = :password_hash';
            $params['password_hash'] = $data['password_hash'];
        }

        if (empty($fields)) {
            return $this->findById($id);
        }

        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        $fields[] = "updated_at = {$nowFunction}";
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";

        $this->db->execute($sql, $params);
        return $this->findById($id);
    }

    /**
     * Удалить пользователя
     */
    public function delete(string $id): bool
    {
        $sql = "DELETE FROM users WHERE id = :id";
        $affected = $this->db->execute($sql, ['id' => $id]);
        return $affected > 0;
    }

    /**
     * Проверить пароль пользователя
     */
    public function verifyPassword(string $email, string $password): ?array
    {
        $user = $this->findByEmailWithPassword($email);
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            return null;
        }

        // Убираем пароль из результата
        unset($user['password_hash']);
        return $user;
    }

    /**
     * Получить всех пользователей (с пагинацией)
     */
    public function getAll(int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT id, email, name, avatar, created_at, updated_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $params = [
            'limit' => $limit,
            'offset' => $offset
        ];

        return $this->db->query($sql, $params);
    }

    /**
     * Подсчитать общее количество пользователей
     */
    public function count(): int
    {
        $sql = "SELECT COUNT(*) as total FROM users";
        $result = $this->db->queryOne($sql);
        return (int) $result['total'];
    }

    /**
     * Поиск пользователей
     */
    public function search(string $query, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $searchTerm = "%{$query}%";
        
        $sql = "SELECT id, email, name, avatar, created_at, updated_at 
                FROM users 
                WHERE name LIKE :search OR email LIKE :search
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $params = [
            'search' => $searchTerm,
            'limit' => $limit,
            'offset' => $offset
        ];

        return $this->db->query($sql, $params);
    }

    /**
     * Обновить настройки пользователя
     */
    public function updateSettings(string $id, array $settings): ?array
    {
        $sql = "UPDATE users SET settings = :settings, updated_at = datetime('now') WHERE id = :id";
        
        $params = [
            'id' => $id,
            'settings' => json_encode($settings)
        ];

        $this->db->execute($sql, $params);
        return $this->findById($id);
    }

    /**
     * Получить статистику пользователя
     */
    public function getStats(string $userId): array
    {
        // Количество задач
        $tasksSql = "SELECT 
                        COUNT(*) as total_tasks,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
                     FROM tasks WHERE user_id = :user_id";
        
        $taskStats = $this->db->queryOne($tasksSql, ['user_id' => $userId]);

        // Количество проектов
        $projectsSql = "SELECT COUNT(*) as total_projects FROM projects WHERE user_id = :user_id";
        $projectStats = $this->db->queryOne($projectsSql, ['user_id' => $userId]);

        return [
            'total_tasks' => (int) $taskStats['total_tasks'],
            'completed_tasks' => (int) $taskStats['completed_tasks'],
            'total_projects' => (int) $projectStats['total_projects'],
            'completion_rate' => $taskStats['total_tasks'] > 0 
                ? round(($taskStats['completed_tasks'] / $taskStats['total_tasks']) * 100, 2) 
                : 0
        ];
    }

    /**
     * Сохранить аватарку в базе данных
     */
    public function saveAvatar(string $userId, string $avatarData, string $mimeType, int $size): bool
    {
        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        $sql = "UPDATE users SET 
                    avatar_data = :avatar_data,
                    avatar_mime_type = :avatar_mime_type,
                    avatar_size = :avatar_size,
                    updated_at = {$nowFunction}
                WHERE id = :id";
        
        $params = [
            'id' => $userId,
            'avatar_data' => $avatarData,
            'avatar_mime_type' => $mimeType,
            'avatar_size' => $size
        ];

        $affected = $this->db->execute($sql, $params);
        return $affected > 0;
    }

    /**
     * Получить аватарку пользователя
     */
    public function getAvatar(string $userId): ?array
    {
        $sql = "SELECT avatar_data, avatar_mime_type, avatar_size 
                FROM users WHERE id = :id";
        
        return $this->db->queryOne($sql, ['id' => $userId]);
    }

    /**
     * Удалить аватарку пользователя
     */
    public function deleteAvatar(string $userId): bool
    {
        // Определяем тип базы данных для правильного синтаксиса
        $dbType = $this->db->getDatabaseType();
        $nowFunction = $dbType === 'sqlite' ? "datetime('now')" : "NOW()";
        
        $sql = "UPDATE users SET 
                    avatar_data = NULL,
                    avatar_mime_type = NULL,
                    avatar_size = NULL,
                    updated_at = {$nowFunction}
                WHERE id = :id";
        
        $affected = $this->db->execute($sql, ['id' => $userId]);
        return $affected > 0;
    }

    /**
     * Получить пользователя без аватарки (для списков)
     */
    public function findByIdWithoutAvatar(string $id): ?array
    {
        $sql = "SELECT id, email, name, avatar, settings, email_verified_at, created_at, updated_at 
                FROM users WHERE id = :id";
        
        return $this->db->queryOne($sql, ['id' => $id]);
    }
}

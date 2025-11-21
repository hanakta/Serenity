<?php

namespace App\Models;

use PDO;
use Exception;

class PomodoroSession
{
    private $db;
    private $table = 'pomodoro_sessions';

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Создать новую сессию Pomodoro
     */
    public function create(array $data): array
    {
        try {
            // Генерируем уникальный ID (максимум 36 символов)
            $sessionId = 'pom_' . uniqid() . '_' . substr(bin2hex(random_bytes(4)), 0, 8);
            
            // Конвертируем ISO даты в MySQL формат
            $startTime = date('Y-m-d H:i:s', strtotime($data['start_time']));
            $endTime = date('Y-m-d H:i:s', strtotime($data['end_time']));
            
            $sql = "INSERT INTO {$this->table} 
                    (id, user_id, task_id, task_title, start_time, end_time, duration, type, completed, created_at) 
                    VALUES (:id, :user_id, :task_id, :task_title, :start_time, :end_time, :duration, :type, :completed, NOW())";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'id' => $sessionId,
                'user_id' => $data['user_id'],
                'task_id' => $data['task_id'] ?? null,
                'task_title' => $data['task_title'] ?? null,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $data['duration'],
                'type' => $data['type'],
                'completed' => $data['completed'] ? 1 : 0
            ]);
            
            // Отладочная информация
            if (!$result) {
                $errorInfo = $stmt->errorInfo();
                throw new Exception("Ошибка выполнения SQL: " . implode(', ', $errorInfo));
            }
            
            // Проверяем количество затронутых строк
            $rowCount = $stmt->rowCount();
            if ($rowCount === 0) {
                throw new Exception("Не удалось вставить запись. Затронуто строк: $rowCount");
            }
            
            // Проверяем автокоммит
            $autocommit = $this->db->getAttribute(PDO::ATTR_AUTOCOMMIT);
            if (!$autocommit) {
                $this->db->commit();
            }

            return $this->findById($sessionId);
        } catch (Exception $e) {
            throw new Exception("Ошибка создания сессии Pomodoro: " . $e->getMessage());
        }
    }

    /**
     * Найти сессию по ID
     */
    public function findById(string $id): array
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['id' => $id]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$result) {
                // Отладочная информация
                error_log("PomodoroSession::findById - Запись не найдена для ID: $id");
                return [];
            }
            return $result;
        } catch (Exception $e) {
            throw new Exception("Ошибка поиска сессии: " . $e->getMessage());
        }
    }

    /**
     * Получить все сессии пользователя
     */
    public function findByUserId(string $userId, array $filters = []): array
    {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE user_id = :user_id";
            $params = ['user_id' => $userId];

            // Фильтры
            if (!empty($filters['type'])) {
                $sql .= " AND type = :type";
                $params['type'] = $filters['type'];
            }

            if (!empty($filters['date_from'])) {
                $sql .= " AND DATE(start_time) >= :date_from";
                $params['date_from'] = $filters['date_from'];
            }

            if (!empty($filters['date_to'])) {
                $sql .= " AND DATE(start_time) <= :date_to";
                $params['date_to'] = $filters['date_to'];
            }

            if (!empty($filters['completed'])) {
                $sql .= " AND completed = :completed";
                $params['completed'] = $filters['completed'] ? 1 : 0;
            }

            $sql .= " ORDER BY start_time DESC";

            if (!empty($filters['limit'])) {
                $sql .= " LIMIT :limit";
                $params['limit'] = (int)$filters['limit'];
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Ошибка получения сессий: " . $e->getMessage());
        }
    }

    /**
     * Получить статистику пользователя
     */
    public function getStats(string $userId, string $period = 'week'): array
    {
        try {
            $dateCondition = '';
            switch ($period) {
                case 'day':
                    $dateCondition = "AND DATE(start_time) = CURDATE()";
                    break;
                case 'week':
                    $dateCondition = "AND start_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
                    break;
                case 'month':
                    $dateCondition = "AND start_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
                    break;
                case 'year':
                    $dateCondition = "AND start_time >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
                    break;
            }

            $sql = "SELECT 
                        COUNT(*) as total_sessions,
                        SUM(CASE WHEN type = 'focus' THEN 1 ELSE 0 END) as focus_sessions,
                        SUM(CASE WHEN type = 'shortBreak' THEN 1 ELSE 0 END) as short_break_sessions,
                        SUM(CASE WHEN type = 'longBreak' THEN 1 ELSE 0 END) as long_break_sessions,
                        SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as total_focus_time,
                        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
                        AVG(CASE WHEN type = 'focus' THEN duration ELSE NULL END) as avg_focus_duration
                    FROM {$this->table} 
                    WHERE user_id = :user_id {$dateCondition}";

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['user_id' => $userId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Преобразуем числовые значения
            return [
                'total_sessions' => (int)($result['total_sessions'] ?? 0),
                'focus_sessions' => (int)($result['focus_sessions'] ?? 0),
                'short_break_sessions' => (int)($result['short_break_sessions'] ?? 0),
                'long_break_sessions' => (int)($result['long_break_sessions'] ?? 0),
                'total_focus_time' => (int)($result['total_focus_time'] ?? 0),
                'completed_sessions' => (int)($result['completed_sessions'] ?? 0),
                'avg_focus_duration' => round((float)($result['avg_focus_duration'] ?? 0), 2)
            ];
        } catch (Exception $e) {
            throw new Exception("Ошибка получения статистики: " . $e->getMessage());
        }
    }

    /**
     * Получить дневную активность
     */
    public function getDailyActivity(string $userId, int $days = 7): array
    {
        try {
            $sql = "SELECT 
                        DATE(start_time) as date,
                        COUNT(*) as sessions,
                        SUM(CASE WHEN type = 'focus' THEN 1 ELSE 0 END) as focus_sessions,
                        SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as focus_time
                    FROM {$this->table} 
                    WHERE user_id = :user_id 
                    AND start_time >= DATE_SUB(NOW(), INTERVAL :days DAY)
                    GROUP BY DATE(start_time)
                    ORDER BY date DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'user_id' => $userId,
                'days' => $days
            ]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Ошибка получения дневной активности: " . $e->getMessage());
        }
    }

    /**
     * Получить общую статистику за все время
     */
    public function getLifetimeStats(string $userId): array
    {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_sessions,
                        SUM(CASE WHEN type = 'focus' THEN 1 ELSE 0 END) as focus_sessions,
                        SUM(CASE WHEN type = 'shortBreak' THEN 1 ELSE 0 END) as short_break_sessions,
                        SUM(CASE WHEN type = 'longBreak' THEN 1 ELSE 0 END) as long_break_sessions,
                        SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as total_focus_time,
                        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
                        AVG(CASE WHEN type = 'focus' THEN duration ELSE NULL END) as avg_focus_duration,
                        MIN(start_time) as first_session_date,
                        MAX(start_time) as last_session_date,
                        COUNT(DISTINCT DATE(start_time)) as active_days
                    FROM {$this->table} 
                    WHERE user_id = :user_id";

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['user_id' => $userId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Преобразуем числовые значения
            return [
                'total_sessions' => (int)($result['total_sessions'] ?? 0),
                'focus_sessions' => (int)($result['focus_sessions'] ?? 0),
                'short_break_sessions' => (int)($result['short_break_sessions'] ?? 0),
                'long_break_sessions' => (int)($result['long_break_sessions'] ?? 0),
                'total_focus_time' => (int)($result['total_focus_time'] ?? 0),
                'completed_sessions' => (int)($result['completed_sessions'] ?? 0),
                'avg_focus_duration' => round((float)($result['avg_focus_duration'] ?? 0), 2),
                'first_session_date' => $result['first_session_date'],
                'last_session_date' => $result['last_session_date'],
                'active_days' => (int)($result['active_days'] ?? 0),
                'total_focus_hours' => round((int)($result['total_focus_time'] ?? 0) / 60, 2)
            ];
        } catch (Exception $e) {
            throw new Exception("Ошибка получения общей статистики: " . $e->getMessage());
        }
    }

    /**
     * Получить статистику по неделям
     */
    public function getWeeklyStats(string $userId, int $weeks = 12): array
    {
        try {
            $sql = "SELECT 
                        YEARWEEK(start_time) as week,
                        COUNT(*) as sessions,
                        SUM(CASE WHEN type = 'focus' THEN 1 ELSE 0 END) as focus_sessions,
                        SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as focus_time,
                        COUNT(DISTINCT DATE(start_time)) as active_days
                    FROM {$this->table} 
                    WHERE user_id = :user_id 
                    AND start_time >= DATE_SUB(NOW(), INTERVAL :weeks WEEK)
                    GROUP BY YEARWEEK(start_time)
                    ORDER BY week DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'user_id' => $userId,
                'weeks' => $weeks
            ]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Ошибка получения недельной статистики: " . $e->getMessage());
        }
    }

    /**
     * Получить статистику по месяцам
     */
    public function getMonthlyStats(string $userId, int $months = 12): array
    {
        try {
            $sql = "SELECT 
                        DATE_FORMAT(start_time, '%Y-%m') as month,
                        COUNT(*) as sessions,
                        SUM(CASE WHEN type = 'focus' THEN 1 ELSE 0 END) as focus_sessions,
                        SUM(CASE WHEN type = 'focus' THEN duration ELSE 0 END) as focus_time,
                        COUNT(DISTINCT DATE(start_time)) as active_days
                    FROM {$this->table} 
                    WHERE user_id = :user_id 
                    AND start_time >= DATE_SUB(NOW(), INTERVAL :months MONTH)
                    GROUP BY DATE_FORMAT(start_time, '%Y-%m')
                    ORDER BY month DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'user_id' => $userId,
                'months' => $months
            ]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Ошибка получения месячной статистики: " . $e->getMessage());
        }
    }

    /**
     * Получить топ задач по времени фокуса
     */
    public function getTopTasks(string $userId, int $limit = 10): array
    {
        try {
            $sql = "SELECT 
                        task_id,
                        task_title,
                        COUNT(*) as sessions_count,
                        SUM(duration) as total_duration,
                        AVG(duration) as avg_duration,
                        MAX(start_time) as last_session
                    FROM {$this->table} 
                    WHERE user_id = :user_id 
                    AND type = 'focus' 
                    AND task_id IS NOT NULL
                    GROUP BY task_id, task_title
                    ORDER BY total_duration DESC
                    LIMIT :limit";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'user_id' => $userId,
                'limit' => $limit
            ]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Ошибка получения топ задач: " . $e->getMessage());
        }
    }

    /**
     * Обновить сессию
     */
    public function update(string $id, array $data): array
    {
        try {
            $fields = [];
            $params = ['id' => $id];

            foreach ($data as $key => $value) {
                if (in_array($key, ['task_id', 'task_title', 'end_time', 'duration', 'type', 'completed'])) {
                    $fields[] = "{$key} = :{$key}";
                    // Преобразуем boolean в integer для поля completed
                    if ($key === 'completed') {
                        $params[$key] = $value ? 1 : 0;
                    } elseif ($key === 'end_time') {
                        // Конвертируем ISO дату в MySQL формат
                        $params[$key] = date('Y-m-d H:i:s', strtotime($value));
                    } else {
                        $params[$key] = $value;
                    }
                }
            }

            if (empty($fields)) {
                throw new Exception("Нет полей для обновления");
            }

            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return $this->findById($id);
        } catch (Exception $e) {
            throw new Exception("Ошибка обновления сессии: " . $e->getMessage());
        }
    }

    /**
     * Удалить сессию
     */
    public function delete(string $id): bool
    {
        try {
            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['id' => $id]);
            
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            throw new Exception("Ошибка удаления сессии: " . $e->getMessage());
        }
    }

}


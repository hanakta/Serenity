<?php

namespace App\Models;

use App\Database\Database;

class CookieConsent
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Сохранить согласие на cookies
     */
    public function saveConsent($data)
    {
        try {
            $sql = "INSERT INTO cookie_consents (user_id, session_id, consent_type, accepted, ip_address, user_agent) 
                    VALUES (:user_id, :session_id, :consent_type, :accepted, :ip_address, :user_agent)";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':user_id' => $data['user_id'] ?? null,
                ':session_id' => $data['session_id'] ?? session_id(),
                ':consent_type' => $data['consent_type'] ?? 'all',
                ':accepted' => $data['accepted'] ? 1 : 0,
                ':ip_address' => $data['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
                ':user_agent' => $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);

            if ($result) {
                $consentId = $this->db->lastInsertId();
                
                // Сохраняем детали по типам cookies
                if (isset($data['cookie_types']) && is_array($data['cookie_types'])) {
                    $this->saveConsentDetails($consentId, $data['cookie_types']);
                }
                
                return $consentId;
            }
            
            return false;
        } catch (\Exception $e) {
            error_log("Cookie consent save error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Сохранить детали согласия по типам cookies
     */
    private function saveConsentDetails($consentId, $cookieTypes)
    {
        try {
            $sql = "INSERT INTO cookie_consent_details (consent_id, cookie_type_id, accepted) 
                    VALUES (:consent_id, :cookie_type_id, :accepted)";
            
            $stmt = $this->db->prepare($sql);
            
            foreach ($cookieTypes as $typeId => $accepted) {
                $stmt->execute([
                    ':consent_id' => $consentId,
                    ':cookie_type_id' => $typeId,
                    ':accepted' => $accepted ? 1 : 0
                ]);
            }
            
            return true;
        } catch (\Exception $e) {
            error_log("Cookie consent details save error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить последнее согласие пользователя
     */
    public function getLastConsent($userId = null, $sessionId = null)
    {
        try {
            $sql = "SELECT * FROM cookie_consents WHERE 1=1";
            $params = [];
            
            if ($userId) {
                $sql .= " AND user_id = :user_id";
                $params[':user_id'] = $userId;
            } elseif ($sessionId) {
                $sql .= " AND session_id = :session_id";
                $params[':session_id'] = $sessionId;
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT 1";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Cookie consent get error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить все типы cookies
     */
    public function getCookieTypes()
    {
        try {
            $sql = "SELECT * FROM cookie_types ORDER BY required DESC, name ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Cookie types get error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить статистику согласий
     */
    public function getConsentStats($days = 30)
    {
        try {
            // Определяем тип базы данных
            $dbType = $this->db->getAttribute(\PDO::ATTR_DRIVER_NAME);
            
            if ($dbType === 'sqlite') {
                $sql = "SELECT 
                            DATE(created_at) as date,
                            COUNT(*) as total_consents,
                            SUM(CASE WHEN accepted = 1 THEN 1 ELSE 0 END) as accepted_count,
                            SUM(CASE WHEN accepted = 0 THEN 1 ELSE 0 END) as declined_count
                        FROM cookie_consents 
                        WHERE created_at >= datetime('now', '-{$days} days')
                        GROUP BY DATE(created_at)
                        ORDER BY date DESC";
            } else {
                // MySQL версия
                $sql = "SELECT 
                            DATE(created_at) as date,
                            COUNT(*) as total_consents,
                            SUM(CASE WHEN accepted = 1 THEN 1 ELSE 0 END) as accepted_count,
                            SUM(CASE WHEN accepted = 0 THEN 1 ELSE 0 END) as declined_count
                        FROM cookie_consents 
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date DESC";
            }
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Cookie consent stats error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Проверить, дал ли пользователь согласие
     */
    public function hasConsent($userId = null, $sessionId = null)
    {
        $consent = $this->getLastConsent($userId, $sessionId);
        return $consent && $consent['accepted'] == 1;
    }

    /**
     * Удалить старые записи (старше 1 года)
     */
    public function cleanupOldRecords()
    {
        try {
            // Определяем тип базы данных
            $dbType = $this->db->getAttribute(\PDO::ATTR_DRIVER_NAME);
            
            if ($dbType === 'sqlite') {
                $sql = "DELETE FROM cookie_consents WHERE created_at < datetime('now', '-1 year')";
            } else {
                // MySQL версия
                $sql = "DELETE FROM cookie_consents WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            }
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute();
            
            return $stmt->rowCount();
        } catch (\Exception $e) {
            error_log("Cookie consent cleanup error: " . $e->getMessage());
            return false;
        }
    }
}

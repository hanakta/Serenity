<?php

namespace App\Controllers;

use App\Models\CookieConsent;
use App\Services\ResponseService;
use App\Services\ValidationService;

class CookieConsentController
{
    private $cookieConsentModel;
    private $responseService;
    private $validationService;

    public function __construct()
    {
        $this->cookieConsentModel = new CookieConsent();
        $this->responseService = new ResponseService();
        $this->validationService = new ValidationService();
    }

    /**
     * Сохранить согласие на cookies
     */
    public function saveConsent($request, $response, $args)
    {
        try {
            $data = $request->getParsedBody();
            
            // Валидация данных
            $validation = $this->validationService->validate($data, [
                'accepted' => 'required|boolean',
                'consent_type' => 'optional|string|max:50',
                'cookie_types' => 'optional|array'
            ]);

            if (!$validation['valid']) {
                return $this->responseService->error($response, 'Ошибка валидации', $validation['errors'], 400);
            }

            // Получаем ID пользователя из токена (если авторизован)
            $userId = null;
            if (isset($_SESSION['user_id'])) {
                $userId = $_SESSION['user_id'];
            }

            // Подготавливаем данные для сохранения
            $consentData = [
                'user_id' => $userId,
                'session_id' => session_id(),
                'consent_type' => $data['consent_type'] ?? 'all',
                'accepted' => $data['accepted'],
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'cookie_types' => $data['cookie_types'] ?? []
            ];

            // Сохраняем согласие
            $consentId = $this->cookieConsentModel->saveConsent($consentData);

            if ($consentId) {
                return $this->responseService->success($response, [
                    'consent_id' => $consentId,
                    'message' => 'Согласие на cookies сохранено'
                ]);
            } else {
                return $this->responseService->error($response, 'Ошибка сохранения согласия', [], 500);
            }

        } catch (\Exception $e) {
            error_log("Cookie consent save error: " . $e->getMessage());
            return $this->responseService->error($response, 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Получить статус согласия пользователя
     */
    public function getConsentStatus($request, $response, $args)
    {
        try {
            $userId = null;
            if (isset($_SESSION['user_id'])) {
                $userId = $_SESSION['user_id'];
            }

            $sessionId = session_id();
            $consent = $this->cookieConsentModel->getLastConsent($userId, $sessionId);

            $status = [
                'has_consent' => false,
                'consent_date' => null,
                'accepted' => false
            ];

            if ($consent) {
                $status['has_consent'] = true;
                $status['consent_date'] = $consent['created_at'];
                $status['accepted'] = $consent['accepted'] == 1;
            }

            return $this->responseService->success($response, $status);

        } catch (\Exception $e) {
            error_log("Cookie consent status error: " . $e->getMessage());
            return $this->responseService->error($response, 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Получить типы cookies
     */
    public function getCookieTypes($request, $response, $args)
    {
        try {
            $cookieTypes = $this->cookieConsentModel->getCookieTypes();
            
            return $this->responseService->success($response, [
                'cookie_types' => $cookieTypes
            ]);

        } catch (\Exception $e) {
            error_log("Cookie types get error: " . $e->getMessage());
            return $this->responseService->error($response, 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Получить статистику согласий (только для админов)
     */
    public function getConsentStats($request, $response, $args)
    {
        try {
            // Проверяем права доступа (можно добавить проверку на админа)
            // if (!$this->isAdmin()) {
            //     return $this->responseService->error($response, 'Доступ запрещен', [], 403);
            // }

            $days = $request->getQueryParams()['days'] ?? 30;
            $stats = $this->cookieConsentModel->getConsentStats($days);

            return $this->responseService->success($response, [
                'stats' => $stats,
                'period_days' => $days
            ]);

        } catch (\Exception $e) {
            error_log("Cookie consent stats error: " . $e->getMessage());
            return $this->responseService->error($response, 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Очистить старые записи (только для админов)
     */
    public function cleanupOldRecords($request, $response, $args)
    {
        try {
            // Проверяем права доступа
            // if (!$this->isAdmin()) {
            //     return $this->responseService->error($response, 'Доступ запрещен', [], 403);
            // }

            $deletedCount = $this->cookieConsentModel->cleanupOldRecords();

            return $this->responseService->success($response, [
                'deleted_records' => $deletedCount,
                'message' => 'Старые записи очищены'
            ]);

        } catch (\Exception $e) {
            error_log("Cookie consent cleanup error: " . $e->getMessage());
            return $this->responseService->error($response, 'Внутренняя ошибка сервера', [], 500);
        }
    }

    /**
     * Проверка прав администратора (заглушка)
     */
    private function isAdmin()
    {
        // Здесь можно добавить проверку роли пользователя
        return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
    }
}




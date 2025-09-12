<?php
// Тест HTTP аутентификации

require_once 'vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\JWTService;
use App\Middleware\AuthMiddleware;

echo "=== Тест HTTP аутентификации ===\n";

try {
    // Создаем токен
    $jwtService = new JWTService();
    $token = $jwtService->generateToken('demo-user-0000-0000-0000-000000000001');
    echo "Токен создан: " . substr($token, 0, 50) . "...\n";
    
    // Тестируем извлечение токена из заголовка
    $authHeader = "Bearer " . $token;
    $extractedToken = $jwtService->extractTokenFromHeader($authHeader);
    echo "Извлеченный токен: " . ($extractedToken ? "OK" : "FAILED") . "\n";
    
    // Тестируем валидацию
    $payload = $jwtService->validateToken($extractedToken);
    echo "Payload получен: " . (isset($payload['user_id']) ? "OK" : "FAILED") . "\n";
    echo "User ID: " . $payload['user_id'] . "\n";
    
    // Тестируем проверки
    $isAccess = $jwtService->isAccessToken($payload);
    $isExpired = $jwtService->isTokenExpired($payload);
    echo "Access токен: " . ($isAccess ? "OK" : "FAILED") . "\n";
    echo "Не истек: " . (!$isExpired ? "OK" : "FAILED") . "\n";
    
    // Тестируем полный процесс AuthMiddleware
    echo "\nТестируем полный процесс AuthMiddleware...\n";
    
    // Создаем моковый HTTP запрос
    $mockRequest = new class {
        public function getHeaderLine($name) {
            if ($name === 'Authorization') {
                return "Bearer " . $GLOBALS['test_token'];
            }
            return '';
        }
        
        public function withAttribute($name, $value) {
            $this->$name = $value;
            return $this;
        }
    };
    
    $GLOBALS['test_token'] = $token;
    
    // Тестируем AuthMiddleware
    $authMiddleware = new AuthMiddleware();
    
    // Создаем моковый handler
    $mockHandler = new class {
        public function handle($request) {
            echo "Handler вызван с user_id: " . ($request->user_id ?? 'не установлен') . "\n";
            return "OK";
        }
    };
    
    // Тестируем middleware
    try {
        $result = $authMiddleware($mockRequest, $mockHandler);
        echo "AuthMiddleware результат: " . $result . "\n";
    } catch (Exception $e) {
        echo "❌ Ошибка AuthMiddleware: " . $e->getMessage() . "\n";
    }
    
    echo "\n✅ Тест завершен!\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


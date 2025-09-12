<?php
// Прямой тест AuthMiddleware

require_once 'vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\JWTService;
use App\Middleware\AuthMiddleware;

echo "=== Прямой тест AuthMiddleware ===\n";

try {
    // Создаем токен
    $jwtService = new JWTService();
    $token = $jwtService->generateToken('demo-user-0000-0000-0000-000000000001');
    echo "Токен создан: " . substr($token, 0, 50) . "...\n";
    
    // Тестируем валидацию токена
    echo "\nТестируем валидацию токена...\n";
    $payload = $jwtService->validateToken($token);
    echo "Payload: " . print_r($payload, true) . "\n";
    
    // Тестируем извлечение токена из заголовка
    echo "\nТестируем извлечение токена...\n";
    $authHeader = "Bearer " . $token;
    $extractedToken = $jwtService->extractTokenFromHeader($authHeader);
    echo "Извлеченный токен: " . ($extractedToken ? substr($extractedToken, 0, 50) . "..." : "null") . "\n";
    
    // Тестируем проверки
    echo "\nТестируем проверки...\n";
    $isAccess = $jwtService->isAccessToken($payload);
    $isExpired = $jwtService->isTokenExpired($payload);
    echo "Access токен: " . ($isAccess ? 'Да' : 'Нет') . "\n";
    echo "Истек: " . ($isExpired ? 'Да' : 'Нет') . "\n";
    
    // Тестируем AuthMiddleware
    echo "\nТестируем AuthMiddleware...\n";
    $authMiddleware = new AuthMiddleware();
    echo "AuthMiddleware создан успешно\n";
    
    echo "\n✅ Все тесты прошли успешно!\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


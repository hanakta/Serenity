<?php
// Простой тест JWT

require_once 'vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\JWTService;

echo "=== Тест JWT Service ===\n";

try {
    $jwtService = new JWTService();
    
    echo "1. Создаем токен...\n";
    $token = $jwtService->generateToken('demo-user-0000-0000-0000-000000000001');
    echo "Токен создан: " . substr($token, 0, 50) . "...\n";
    
    echo "\n2. Валидируем токен...\n";
    $payload = $jwtService->validateToken($token);
    echo "Payload получен:\n";
    print_r($payload);
    
    echo "\n3. Проверяем тип токена...\n";
    $isAccess = $jwtService->isAccessToken($payload);
    echo "Это access токен: " . ($isAccess ? 'Да' : 'Нет') . "\n";
    
    echo "\n4. Проверяем истечение...\n";
    $isExpired = $jwtService->isTokenExpired($payload);
    echo "Токен истек: " . ($isExpired ? 'Да' : 'Нет') . "\n";
    
    echo "\n✅ JWT Service работает корректно!\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


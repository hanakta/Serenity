<?php
// Тест API команд напрямую

require_once 'vendor/autoload.php';

// Загружаем переменные окружения
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Controllers\TeamController;
use App\Services\JWTService;

echo "=== Тест API команд ===\n";

try {
    // Создаем токен
    $jwtService = new JWTService();
    $token = $jwtService->generateToken('demo-user-0000-0000-0000-000000000001');
    echo "Токен создан: " . substr($token, 0, 50) . "...\n";
    
    // Тестируем валидацию токена
    $payload = $jwtService->validateToken($token);
    echo "User ID: " . $payload['user_id'] . "\n";
    
    // Тестируем создание команды напрямую
    echo "\nТестируем создание команды...\n";
    $teamController = new TeamController();
    
    // Создаем моковый запрос
    $requestData = [
        'name' => 'Тестовая команда',
        'description' => 'Команда для тестирования',
        'color' => '#FF6B6B'
    ];
    
    echo "Данные команды: " . json_encode($requestData) . "\n";
    
    // Проверяем, что контроллер существует
    if (method_exists($teamController, 'create')) {
        echo "Метод create существует\n";
    } else {
        echo "❌ Метод create не найден\n";
    }
    
    echo "\n✅ Тест завершен!\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
}


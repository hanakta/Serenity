<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Services\JWTService;
use Dotenv\Dotenv;

// Загружаем переменные окружения
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$jwtService = new JWTService();

$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzZXJlbml0eS1hcGkiLCJhdWQiOiJzZXJlbml0eS1hcHAiLCJpYXQiOjE3NTc2MDcyMzksImV4cCI6MTc1NzY5MzYzOSwidXNlcl9pZCI6ImRlbW8tdXNlci0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ0eXBlIjoiYWNjZXNzIn0.ddZujgr8oB6ZMteIoXXtXAmyUiZ8u-C6W65W7BUyvGg';

try {
    $payload = $jwtService->validateToken($token);
    echo "Токен валиден:\n";
    print_r($payload);
    
    echo "\nПроверка типа токена: " . ($jwtService->isAccessToken($payload) ? 'true' : 'false') . "\n";
    echo "Проверка истечения: " . ($jwtService->isTokenExpired($payload) ? 'true' : 'false') . "\n";
    
} catch (Exception $e) {
    echo "Ошибка валидации: " . $e->getMessage() . "\n";
}

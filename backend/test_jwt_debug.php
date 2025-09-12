<?php
require 'vendor/autoload.php';
use App\Services\JWTService;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ОТЛАДКА JWT ===\n\n";

$jwtService = new JWTService();
$userId = 'user_68c07c01a9bf62.98434149';

echo "1. Генерируем токен для пользователя: $userId\n";
$token = $jwtService->generateToken($userId);
echo "Токен: " . substr($token, 0, 50) . "...\n\n";

echo "2. Проверяем токен\n";
try {
    $payload = $jwtService->validateToken($token);
    echo "✅ Токен валиден\n";
    echo "Payload: " . json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";
} catch (Exception $e) {
    echo "❌ Ошибка валидации: " . $e->getMessage() . "\n\n";
}

echo "3. Проверяем извлечение токена из заголовка\n";
$authHeader = "Bearer $token";
$extractedToken = $jwtService->extractTokenFromHeader($authHeader);
echo "Извлеченный токен: " . ($extractedToken ? substr($extractedToken, 0, 50) . "..." : "null") . "\n\n";

echo "4. Проверяем тип токена\n";
try {
    $payload = $jwtService->validateToken($token);
    $isAccess = $jwtService->isAccessToken($payload);
    $isExpired = $jwtService->isTokenExpired($payload);
    echo "Access токен: " . ($isAccess ? "да" : "нет") . "\n";
    echo "Истек: " . ($isExpired ? "да" : "нет") . "\n";
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
}



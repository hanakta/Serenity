<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Middleware\AuthMiddleware;
use App\Services\JWTService;
use Dotenv\Dotenv;

// Загружаем переменные окружения
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzZXJlbml0eS1hcGkiLCJhdWQiOiJzZXJlbml0eS1hcHAiLCJpYXQiOjE3NTc2MDc1ODAsImV4cCI6MTc1NzY5Mzk4MCwidXNlcl9pZCI6ImRlbW8tdXNlci0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ0eXBlIjoiYWNjZXNzIn0.x8wr2Yhf3a84ZmOtm8MG8nnVYIPFiFd_VX5DoSWhF8U';

echo "Тестируем JWTService напрямую:\n";
$jwtService = new JWTService();
try {
    $payload = $jwtService->validateToken($token);
    echo "JWTService работает: " . json_encode($payload) . "\n";
} catch (Exception $e) {
    echo "JWTService ошибка: " . $e->getMessage() . "\n";
}

echo "\nТестируем AuthMiddleware:\n";
$authMiddleware = new AuthMiddleware();
echo "AuthMiddleware создан успешно\n";

echo "\nПроверяем секретный ключ:\n";
echo "JWT_SECRET: " . ($_ENV['JWT_SECRET'] ?? 'не установлен') . "\n";
echo "JWT_ALGORITHM: " . ($_ENV['JWT_ALGORITHM'] ?? 'не установлен') . "\n";

echo "\nТестируем JWTService в AuthMiddleware:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    $payload = $jwtService->validateToken($token);
    echo "JWTService в AuthMiddleware работает: " . json_encode($payload) . "\n";
    
    // Проверяем методы валидации
    echo "isAccessToken: " . ($jwtService->isAccessToken($payload) ? 'true' : 'false') . "\n";
    echo "isTokenExpired: " . ($jwtService->isTokenExpired($payload) ? 'true' : 'false') . "\n";
    
} catch (Exception $e) {
    echo "JWTService в AuthMiddleware ошибка: " . $e->getMessage() . "\n";
}

echo "\nТестируем извлечение токена из заголовка:\n";
$authHeader = "Bearer " . $token;
echo "Auth header: " . $authHeader . "\n";

if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $extractedToken = $matches[1];
    echo "Извлеченный токен: " . $extractedToken . "\n";
    echo "Токены совпадают: " . ($extractedToken === $token ? 'true' : 'false') . "\n";
} else {
    echo "Не удалось извлечь токен\n";
}

echo "\nТестируем полный процесс AuthMiddleware:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    // Симулируем процесс AuthMiddleware
    $extractedToken = $jwtService->extractTokenFromHeader($authHeader);
    echo "Извлеченный токен через JWTService: " . $extractedToken . "\n";
    
    if (!$extractedToken) {
        echo "Токен не извлечен\n";
    } else {
        $payload = $jwtService->validateToken($extractedToken);
        echo "Токен валиден: " . json_encode($payload) . "\n";
        
        if (!$jwtService->isAccessToken($payload)) {
            echo "Недействительный тип токена\n";
        } else {
            echo "Тип токена валиден\n";
        }
        
        if ($jwtService->isTokenExpired($payload)) {
            echo "Токен истек\n";
        } else {
            echo "Токен не истек\n";
        }
    }
    
} catch (Exception $e) {
    echo "Ошибка в процессе AuthMiddleware: " . $e->getMessage() . "\n";
}

echo "\nТестируем с пустым токеном:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    $extractedToken = $jwtService->extractTokenFromHeader("");
    echo "Пустой токен: " . ($extractedToken ? $extractedToken : 'null') . "\n";
    
} catch (Exception $e) {
    echo "Ошибка с пустым токеном: " . $e->getMessage() . "\n";
}

echo "\nТестируем с невалидным токеном:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    $invalidToken = "invalid.token.here";
    $payload = $jwtService->validateToken($invalidToken);
    echo "Невалидный токен валиден: " . json_encode($payload) . "\n";
    
} catch (Exception $e) {
    echo "Ошибка с невалидным токеном: " . $e->getMessage() . "\n";
}

echo "\nТестируем с токеном с неправильной подписью:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    $invalidToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzZXJlbml0eS1hcGkiLCJhdWQiOiJzZXJlbml0eS1hcHAiLCJpYXQiOjE3NTc2MDc1ODAsImV4cCI6MTc1NzY5Mzk4MCwidXNlcl9pZCI6ImRlbW8tdXNlci0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ0eXBlIjoiYWNjZXNzIn0.invalid_signature";
    $payload = $jwtService->validateToken($invalidToken);
    echo "Токен с неправильной подписью валиден: " . json_encode($payload) . "\n";
    
} catch (Exception $e) {
    echo "Ошибка с токеном с неправильной подписью: " . $e->getMessage() . "\n";
}

echo "\nТестируем с истекшим токеном:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    // Создаем истекший токен
    $expiredPayload = [
        'iss' => 'serenity-api',
        'aud' => 'serenity-app',
        'iat' => time() - 3600, // 1 час назад
        'exp' => time() - 1800, // 30 минут назад (истек)
        'user_id' => 'demo-user-0000-0000-0000-000000000001',
        'type' => 'access'
    ];
    
    $expiredToken = \Firebase\JWT\JWT::encode($expiredPayload, 'your-secret-key-here-change-in-production', 'HS256');
    $payload = $jwtService->validateToken($expiredToken);
    echo "Истекший токен валиден: " . json_encode($payload) . "\n";
    
} catch (Exception $e) {
    echo "Ошибка с истекшим токеном: " . $e->getMessage() . "\n";
}

echo "\nТестируем с токеном с неправильным типом:\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    // Создаем токен с неправильным типом
    $wrongTypePayload = [
        'iss' => 'serenity-api',
        'aud' => 'serenity-app',
        'iat' => time(),
        'exp' => time() + 3600,
        'user_id' => 'demo-user-0000-0000-0000-000000000001',
        'type' => 'refresh' // неправильный тип
    ];
    
    $wrongTypeToken = \Firebase\JWT\JWT::encode($wrongTypePayload, 'your-secret-key-here-change-in-production', 'HS256');
    $payload = $jwtService->validateToken($wrongTypeToken);
    echo "Токен с неправильным типом валиден: " . json_encode($payload) . "\n";
    
    if (!$jwtService->isAccessToken($payload)) {
        echo "Тип токена неправильный (ожидалось)\n";
    } else {
        echo "Тип токена правильный (неожиданно)\n";
    }
    
} catch (Exception $e) {
    echo "Ошибка с токеном с неправильным типом: " . $e->getMessage() . "\n";
}

echo "\nТестируем с токеном с неправильным типом (через AuthMiddleware):\n";
try {
    $reflection = new ReflectionClass($authMiddleware);
    $property = $reflection->getProperty('jwtService');
    $property->setAccessible(true);
    $jwtService = $property->getValue($authMiddleware);
    
    // Создаем токен с неправильным типом
    $wrongTypePayload = [
        'iss' => 'serenity-api',
        'aud' => 'serenity-app',
        'iat' => time(),
        'exp' => time() + 3600,
        'user_id' => 'demo-user-0000-0000-0000-000000000001',
        'type' => 'refresh' // неправильный тип
    ];
    
    $wrongTypeToken = \Firebase\JWT\JWT::encode($wrongTypePayload, 'your-secret-key-here-change-in-production', 'HS256');
    $payload = $jwtService->validateToken($wrongTypeToken);
    
    if (!$jwtService->isAccessToken($payload)) {
        echo "Тип токена неправильный (ожидалось)\n";
    } else {
        echo "Тип токена правильный (неожиданно)\n";
    }
    
} catch (Exception $e) {
    echo "Ошибка с токеном с неправильным типом: " . $e->getMessage() . "\n";
}

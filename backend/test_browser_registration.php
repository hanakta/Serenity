<?php
require __DIR__ . '/vendor/autoload.php';
use App\Services\ValidationService;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ТЕСТ РЕГИСТРАЦИИ ДЛЯ БРАУЗЕРА ===\n\n";

// Симулируем данные, которые может отправить браузер
$testCases = [
    [
        'name' => 'Тест Пользователь',
        'description' => 'Правильные данные',
        'data' => [
            'name' => 'Тест Пользователь',
            'email' => 'testuser' . time() . '@example.com',
            'password' => 'Password123',
            'confirmPassword' => 'Password123'
        ]
    ],
    [
        'name' => 'Короткое имя',
        'description' => 'Имя меньше 2 символов',
        'data' => [
            'name' => 'А',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'confirmPassword' => 'Password123'
        ]
    ],
    [
        'name' => 'Слабый пароль',
        'description' => 'Пароль без заглавной буквы',
        'data' => [
            'name' => 'Тест Пользователь',
            'email' => 'test@example.com',
            'password' => 'password123',
            'confirmPassword' => 'password123'
        ]
    ],
    [
        'name' => 'Неправильный email',
        'description' => 'Email без @',
        'data' => [
            'name' => 'Тест Пользователь',
            'email' => 'testexample.com',
            'password' => 'Password123',
            'confirmPassword' => 'Password123'
        ]
    ],
    [
        'name' => 'Пароли не совпадают',
        'description' => 'confirmPassword отличается от password',
        'data' => [
            'name' => 'Тест Пользователь',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'confirmPassword' => 'Password456'
        ]
    ]
];

$validator = new ValidationService();

foreach ($testCases as $testCase) {
    echo "=== {$testCase['name']} ===\n";
    echo "Описание: {$testCase['description']}\n";
    echo "Данные:\n";
    print_r($testCase['data']);
    
    $errors = $validator->validateRegistration($testCase['data']);
    
    if (!empty($errors)) {
        echo "❌ Ошибки валидации:\n";
        foreach ($errors as $field => $error) {
            echo "  - $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
        
        // Если валидация прошла, тестируем API
        echo "Тестируем API...\n";
        $response = file_get_contents('http://localhost:8000/api/auth/register', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => json_encode($testCase['data'])
            ]
        ]));
        
        if ($response !== false) {
            $data = json_decode($response, true);
            if (isset($data['success']) && $data['success']) {
                echo "✅ API регистрация успешна\n";
            } else {
                echo "❌ API ошибка: " . ($data['message'] ?? 'Неизвестная ошибка') . "\n";
                if (isset($data['errors'])) {
                    echo "Ошибки API:\n";
                    foreach ($data['errors'] as $field => $error) {
                        echo "  - $field: $error\n";
                    }
                }
            }
        } else {
            echo "❌ Не удалось подключиться к API\n";
        }
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
}

echo "🎉 ТЕСТ ЗАВЕРШЕН!\n";
?>



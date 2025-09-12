<?php
// Тест для проверки регистрации с данными, которые отправляет frontend
require __DIR__ . '/vendor/autoload.php';
use App\Services\ValidationService;
use App\Models\User;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ТЕСТ FRONTEND РЕГИСТРАЦИИ ===\n\n";

// Симулируем данные, которые может отправить frontend
$testData = [
    'name' => 'Тест Пользователь',
    'email' => 'frontendtest' . time() . '@example.com',
    'password' => 'Password123',
    'confirmPassword' => 'Password123'
];

echo "1. Тестируем валидацию...\n";
$validator = new ValidationService();
$errors = $validator->validateRegistration($testData);

if (!empty($errors)) {
    echo "❌ Ошибки валидации:\n";
    foreach ($errors as $field => $error) {
        echo "- $field: $error\n";
    }
} else {
    echo "✅ Валидация прошла успешно\n";
}

echo "\n2. Тестируем API...\n";
$response = file_get_contents('http://localhost:8000/api/auth/register', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode($testData)
    ]
]));

if ($response !== false) {
    $data = json_decode($response, true);
    if (isset($data['success']) && $data['success']) {
        echo "✅ API регистрация успешна\n";
        echo "ID пользователя: " . $data['data']['user']['id'] . "\n";
        echo "Имя: " . $data['data']['user']['name'] . "\n";
        echo "Email: " . $data['data']['user']['email'] . "\n";
    } else {
        echo "❌ API ошибка: " . ($data['message'] ?? 'Неизвестная ошибка') . "\n";
        if (isset($data['errors'])) {
            echo "Ошибки API:\n";
            foreach ($data['errors'] as $field => $error) {
                echo "- $field: $error\n";
            }
        }
    }
} else {
    echo "❌ Не удалось подключиться к API\n";
}

echo "\n3. Тестируем с неправильными данными...\n";

// Тест с неправильным паролем
$wrongData = [
    'name' => 'Тест',
    'email' => 'test@example.com',
    'password' => '123', // Слабый пароль
    'confirmPassword' => '123'
];

$errors2 = $validator->validateRegistration($wrongData);
if (!empty($errors2)) {
    echo "✅ Валидация правильно отклонила слабый пароль:\n";
    foreach ($errors2 as $field => $error) {
        echo "- $field: $error\n";
    }
} else {
    echo "❌ Валидация не отклонила слабый пароль\n";
}

echo "\n🎉 ТЕСТ ЗАВЕРШЕН!\n";
?>



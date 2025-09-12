<?php
require __DIR__ . '/vendor/autoload.php';
use App\Services\ValidationService;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ТЕСТ РЕГИСТРАЦИИ ===\n\n";

try {
    echo "1. Тестируем валидацию регистрации...\n";
    $validator = new ValidationService();
    
    // Тест 1: Пустые данные
    echo "\nТест 1: Пустые данные\n";
    $errors1 = $validator->validateRegistration([]);
    if (!empty($errors1)) {
        echo "Ошибки валидации:\n";
        foreach ($errors1 as $field => $error) {
            echo "- $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
    }
    
    // Тест 2: Неполные данные
    echo "\nТест 2: Неполные данные\n";
    $data2 = [
        'name' => 'Тест',
        'email' => 'test@example.com'
        // Нет пароля и подтверждения
    ];
    $errors2 = $validator->validateRegistration($data2);
    if (!empty($errors2)) {
        echo "Ошибки валидации:\n";
        foreach ($errors2 as $field => $error) {
            echo "- $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
    }
    
    // Тест 3: Неправильный email
    echo "\nТест 3: Неправильный email\n";
    $data3 = [
        'name' => 'Тест',
        'email' => 'неправильный-email',
        'password' => 'Password123',
        'confirmPassword' => 'Password123'
    ];
    $errors3 = $validator->validateRegistration($data3);
    if (!empty($errors3)) {
        echo "Ошибки валидации:\n";
        foreach ($errors3 as $field => $error) {
            echo "- $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
    }
    
    // Тест 4: Слабый пароль
    echo "\nТест 4: Слабый пароль\n";
    $data4 = [
        'name' => 'Тест',
        'email' => 'test@example.com',
        'password' => '123',
        'confirmPassword' => '123'
    ];
    $errors4 = $validator->validateRegistration($data4);
    if (!empty($errors4)) {
        echo "Ошибки валидации:\n";
        foreach ($errors4 as $field => $error) {
            echo "- $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
    }
    
    // Тест 5: Пароли не совпадают
    echo "\nТест 5: Пароли не совпадают\n";
    $data5 = [
        'name' => 'Тест',
        'email' => 'test@example.com',
        'password' => 'Password123',
        'confirmPassword' => 'Password456'
    ];
    $errors5 = $validator->validateRegistration($data5);
    if (!empty($errors5)) {
        echo "Ошибки валидации:\n";
        foreach ($errors5 as $field => $error) {
            echo "- $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
    }
    
    // Тест 6: Правильные данные
    echo "\nТест 6: Правильные данные\n";
    $data6 = [
        'name' => 'Тест Пользователь',
        'email' => 'testuser@example.com',
        'password' => 'Password123',
        'confirmPassword' => 'Password123'
    ];
    $errors6 = $validator->validateRegistration($data6);
    if (!empty($errors6)) {
        echo "Ошибки валидации:\n";
        foreach ($errors6 as $field => $error) {
            echo "- $field: $error\n";
        }
    } else {
        echo "✅ Валидация прошла успешно\n";
    }
    
    echo "\n2. Тестируем API регистрации...\n";
    
    // Тест API с правильными данными
    $registrationData = [
        'name' => 'Новый Пользователь',
        'email' => 'newuser' . time() . '@example.com',
        'password' => 'Password123',
        'confirmPassword' => 'Password123'
    ];
    
    echo "Данные для регистрации:\n";
    print_r($registrationData);
    echo "\n";
    
    $response = file_get_contents('http://localhost:8000/api/auth/register', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($registrationData)
        ]
    ]));
    
    if ($response !== false) {
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success']) {
            echo "✅ Регистрация прошла успешно!\n";
            echo "ID пользователя: " . $data['data']['user']['id'] . "\n";
            echo "Имя: " . $data['data']['user']['name'] . "\n";
            echo "Email: " . $data['data']['user']['email'] . "\n";
            echo "Токен: " . substr($data['data']['token'], 0, 20) . "...\n";
        } else {
            echo "❌ Ошибка регистрации:\n";
            echo "Сообщение: " . ($data['message'] ?? 'Неизвестная ошибка') . "\n";
            if (isset($data['errors'])) {
                echo "Ошибки валидации:\n";
                foreach ($data['errors'] as $field => $error) {
                    echo "- $field: $error\n";
                }
            }
        }
    } else {
        echo "❌ Не удалось подключиться к API\n";
    }

    echo "\n🎉 ТЕСТ ЗАВЕРШЕН!\n";

} catch (Exception $e) {
    echo "❌ ОШИБКА: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
?>



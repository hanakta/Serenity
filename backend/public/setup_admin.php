<?php
// Простой скрипт для настройки супер-администратора

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Database/Database.php';
require_once __DIR__ . '/../src/Models/User.php';

use App\Database\Database;
use App\Models\User;

try {
    echo "🔧 Настройка супер-администратора...\n";
    
    $userModel = new User();
    
    // Данные для супер-администратора
    $adminData = [
        'email' => 'admin@serenity.com',
        'name' => 'Супер-администратор',
        'password' => 'admin123',
        'role' => 'super_admin'
    ];

    // Проверяем, существует ли уже супер-администратор
    $existingAdmin = $userModel->findByEmail($adminData['email']);
    
    if ($existingAdmin) {
        // Обновляем роль существующего пользователя
        $userModel->updateRole($existingAdmin['id'], 'super_admin');
        echo "✅ Супер-администратор уже существует. Роль обновлена.\n";
    } else {
        // Создаем нового супер-администратора
        $admin = $userModel->create($adminData);
        echo "✅ Супер-администратор создан успешно!\n";
    }
    
    echo "📧 Email: " . $adminData['email'] . "\n";
    echo "🔑 Пароль: " . $adminData['password'] . "\n";
    echo "🛡️ Роль: super_admin\n";
    echo "\n🎉 Настройка завершена!\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
}
?>


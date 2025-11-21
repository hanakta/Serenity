<?php
// Скрипт для добавления поля role в таблицу users

require_once 'backend/vendor/autoload.php';
require_once 'backend/src/Database/Database.php';

use App\Database\Database;

try {
    echo "🔧 Добавление поля role в таблицу users...\n";
    
    $db = Database::getInstance();
    
    // Проверяем, есть ли уже поле role
    $result = $db->query("SHOW COLUMNS FROM users LIKE 'role'");
    
    if (count($result) > 0) {
        echo "✅ Поле 'role' уже существует в таблице users.\n";
    } else {
        // Добавляем поле role
        $db->execute("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin', 'super_admin') DEFAULT 'user'");
        echo "✅ Поле 'role' успешно добавлено в таблицу users.\n";
    }
    
    // Добавляем индекс для поля role
    try {
        $db->execute("ALTER TABLE users ADD INDEX idx_role (role)");
        echo "✅ Индекс для поля 'role' добавлен.\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "ℹ️  Индекс для поля 'role' уже существует.\n";
        } else {
            throw $e;
        }
    }
    
    // Обновляем роль пользователя admin@serenity.com
    $userModel = new \App\Models\User();
    $admin = $userModel->findByEmail('admin@serenity.com');
    
    if ($admin) {
        $userModel->updateRole($admin['id'], 'super_admin');
        echo "✅ Роль пользователя admin@serenity.com обновлена на 'super_admin'.\n";
    } else {
        echo "⚠️  Пользователь admin@serenity.com не найден.\n";
    }
    
    echo "\n🎉 Настройка завершена! Теперь пользователь admin@serenity.com имеет права супер-администратора.\n";
    echo "📧 Email: admin@serenity.com\n";
    echo "🔑 Пароль: admin123\n";
    echo "🛡️ Роль: super_admin\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "📋 Проверьте настройки базы данных в файле backend/config/database.php\n";
}
?>


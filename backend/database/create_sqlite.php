<?php
// 🐱 Скрипт создания SQLite базы данных для Serenity

require_once __DIR__ . '/../vendor/autoload.php';

$databasePath = __DIR__ . '/serenity.db';

try {
    // Создаем подключение к SQLite
    $pdo = new PDO("sqlite:{$databasePath}", null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "🐱 Подключение к SQLite успешно!\n";

    // Чтение SQL схемы
    $schema = file_get_contents(__DIR__ . '/sqlite_schema.sql');
    
    if ($schema === false) {
        throw new Exception("Не удалось прочитать файл sqlite_schema.sql");
    }

    // Выполнение SQL команд
    $statements = explode(';', $schema);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            try {
                $pdo->exec($statement);
                echo "✅ Выполнено: " . substr($statement, 0, 50) . "...\n";
            } catch (PDOException $e) {
                // Игнорируем ошибки типа "таблица уже существует"
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "⚠️  Предупреждение: " . $e->getMessage() . "\n";
                }
            }
        }
    }

    echo "\n🎉 SQLite база данных создана успешно!\n";
    echo "📊 База данных: {$databasePath}\n";
    echo "👤 Создан демо-пользователь: demo@serenity.com\n";
    echo "🔑 Пароль: password\n";

} catch (Exception $e) {
    echo "❌ Ошибка создания базы данных: " . $e->getMessage() . "\n";
    exit(1);
}

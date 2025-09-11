<?php
// 🐱 Скрипт миграции базы данных для Serenity

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Загрузка переменных окружения
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Параметры подключения к базе данных
$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306';
$database = $_ENV['DB_DATABASE'] ?? 'serenity';
$username = $_ENV['DB_USERNAME'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

try {
    // Подключение к MySQL без выбора базы данных
    $socket = $_ENV['DB_SOCKET'] ?? '/Applications/MAMP/tmp/mysql/mysql.sock';
    $dsn = "mysql:host={$host};port={$port};charset=utf8mb4;unix_socket={$socket}";
    
    $pdo = new PDO(
        $dsn,
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    echo "🐱 Подключение к MySQL успешно!\n";

    // Чтение SQL схемы
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    
    if ($schema === false) {
        throw new Exception("Не удалось прочитать файл schema.sql");
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

    echo "\n🎉 Миграция базы данных завершена успешно!\n";
    echo "📊 База данных '{$database}' создана и настроена.\n";
    echo "👤 Создан демо-пользователь: demo@serenity.com\n";
    echo "🔑 Пароль: password\n";

} catch (Exception $e) {
    echo "❌ Ошибка миграции: " . $e->getMessage() . "\n";
    exit(1);
}

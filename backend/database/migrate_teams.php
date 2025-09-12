<?php
// Миграция для добавления команд

require_once __DIR__ . '/../vendor/autoload.php';

use App\Database\Database;

try {
    $db = Database::getInstance();
    
    echo "🐱 Применение миграции команд...\n";
    
    $sql = file_get_contents(__DIR__ . '/migration_teams_simple.sql');
    $statements = explode(';', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            try {
                $db->execute($statement);
                echo "✅ Выполнено: " . substr($statement, 0, 50) . "...\n";
            } catch (Exception $e) {
                echo "⚠️  Предупреждение: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "🎉 Миграция команд завершена успешно!\n";
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
}

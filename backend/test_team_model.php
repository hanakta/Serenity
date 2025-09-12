<?php
require 'vendor/autoload.php';
use App\Models\Team;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ТЕСТ МОДЕЛИ TEAM ===\n\n";

try {
    $teamModel = new Team();
    echo "✅ Модель Team создана успешно\n\n";
    
    echo "1. Тестируем создание команды\n";
    $teamData = [
        'name' => 'Тестовая команда',
        'description' => 'Описание тестовой команды',
        'color' => '#3B82F6',
        'owner_id' => 'user_68c07c01a9bf62.98434149'
    ];
    
    $result = $teamModel->create($teamData);
    if ($result) {
        echo "✅ Команда создана успешно\n";
        echo "ID: " . $result['id'] . "\n";
        echo "Название: " . $result['name'] . "\n";
    } else {
        echo "❌ Ошибка создания команды\n";
    }
    
    echo "\n2. Тестируем получение команд пользователя\n";
    $teams = $teamModel->getUserTeams('user_68c07c01a9bf62.98434149');
    echo "✅ Команды получены: " . count($teams) . " записей\n";
    foreach ($teams as $team) {
        echo "- " . $team['name'] . " (ID: " . $team['id'] . ")\n";
    }
    
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}



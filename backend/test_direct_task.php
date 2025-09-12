<?php
require __DIR__ . '/vendor/autoload.php';
use App\Models\Task;
use App\Database\Database;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ПРЯМОЙ ТЕСТ СОЗДАНИЯ ЗАДАЧИ ===\n\n";

try {
    echo "1. Проверяем подключение к базе данных...\n";
    $db = Database::getInstance();
    if ($db->isConnected()) {
        echo "✅ Подключение к MySQL активно\n\n";
    } else {
        echo "❌ Нет подключения к базе данных\n";
        exit(1);
    }

    echo "2. Создаем задачу напрямую через модель...\n";
    $taskModel = new Task();
    
    $taskData = [
        'title' => 'Тестовая задача из MySQL',
        'description' => 'Задача создана для тестирования MySQL API',
        'status' => 'todo',
        'priority' => 'medium',
        'category' => 'personal',
        'due_date' => '2025-09-15T10:00:00.000Z',
        'user_id' => 'user_68c07c01a9bf62.98434149'
    ];
    
    echo "Данные для создания:\n";
    print_r($taskData);
    echo "\n";
    
    $task = $taskModel->create($taskData);
    
    if ($task) {
        echo "✅ Задача создана успешно!\n";
        echo "ID: " . $task['id'] . "\n";
        echo "Название: " . $task['title'] . "\n";
        echo "Статус: " . $task['status'] . "\n";
        echo "Приоритет: " . $task['priority'] . "\n";
        echo "Дата выполнения: " . $task['due_date'] . "\n";
        echo "Создана: " . $task['created_at'] . "\n";
    } else {
        echo "❌ Не удалось создать задачу\n";
    }

    echo "\n3. Проверяем статистику...\n";
    $stats = $taskModel->getStats('user_68c07c01a9bf62.98434149');
    echo "✅ Статистика получена:\n";
    echo "Всего задач: " . $stats['total_tasks'] . "\n";
    echo "Выполнено: " . $stats['completed_tasks'] . "\n";
    echo "В работе: " . $stats['in_progress_tasks'] . "\n";
    echo "К выполнению: " . $stats['todo_tasks'] . "\n";

    echo "\n🎉 ТЕСТ ЗАВЕРШЕН!\n";

} catch (Exception $e) {
    echo "❌ ОШИБКА: " . $e->getMessage() . "\n";
    echo "Стек вызовов:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
?>

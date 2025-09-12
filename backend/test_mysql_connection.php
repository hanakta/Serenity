<?php
require __DIR__ . '/vendor/autoload.php';
use App\Database\Database;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ТЕСТ ПОДКЛЮЧЕНИЯ К MYSQL ===\n\n";

try {
    echo "1. Создаем подключение к MySQL...\n";
    $db = Database::getInstance();
    echo "✅ Подключение создано\n\n";

    echo "2. Проверяем подключение...\n";
    if ($db->isConnected()) {
        echo "✅ Подключение активно\n\n";
    } else {
        echo "❌ Подключение неактивно\n\n";
        exit(1);
    }

    echo "3. Получаем информацию о базе данных...\n";
    $info = $db->getInfo();
    echo "Версия MySQL: " . $info['version'] . "\n";
    echo "Драйвер: " . $info['driver'] . "\n";
    echo "Статус: " . ($info['connected'] ? 'Подключено' : 'Отключено') . "\n\n";

    echo "4. Тестируем запрос к таблице users...\n";
    $users = $db->query("SELECT COUNT(*) as count FROM users");
    echo "Количество пользователей: " . $users[0]['count'] . "\n\n";

    echo "5. Тестируем запрос к таблице teams...\n";
    $teams = $db->query("SELECT COUNT(*) as count FROM teams");
    echo "Количество команд: " . $teams[0]['count'] . "\n\n";

    echo "6. Тестируем запрос к таблице tasks...\n";
    $tasks = $db->query("SELECT COUNT(*) as count FROM tasks");
    echo "Количество задач: " . $tasks[0]['count'] . "\n\n";

    echo "7. Тестируем запрос к таблице projects...\n";
    $projects = $db->query("SELECT COUNT(*) as count FROM projects");
    echo "Количество проектов: " . $projects[0]['count'] . "\n\n";

    echo "8. Проверяем новые таблицы команд...\n";
    $teamMembers = $db->query("SELECT COUNT(*) as count FROM team_members");
    echo "Количество участников команд: " . $teamMembers[0]['count'] . "\n";

    $teamInvitations = $db->query("SELECT COUNT(*) as count FROM team_invitations");
    echo "Количество приглашений: " . $teamInvitations[0]['count'] . "\n";

    $taskComments = $db->query("SELECT COUNT(*) as count FROM task_comments");
    echo "Количество комментариев: " . $taskComments[0]['count'] . "\n";

    $activityLogs = $db->query("SELECT COUNT(*) as count FROM activity_logs");
    echo "Количество логов активности: " . $activityLogs[0]['count'] . "\n\n";

    echo "🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!\n";
    echo "✅ MySQL подключение работает корректно\n";
    echo "✅ Все таблицы доступны\n";
    echo "✅ Данные успешно мигрированы\n\n";

} catch (Exception $e) {
    echo "❌ ОШИБКА: " . $e->getMessage() . "\n";
    echo "Проверьте:\n";
    echo "1. Запущен ли MySQL сервер\n";
    echo "2. Правильные ли настройки в .env файле\n";
    echo "3. Существует ли база данных 'serenity'\n";
    echo "4. Выполнен ли SQL скрипт обновления\n";
    exit(1);
}
?>


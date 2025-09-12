<?php
require 'vendor/autoload.php';
use App\Controllers\TeamController;
use App\Services\JWTService;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== ПРЯМОЙ ТЕСТ КОНТРОЛЛЕРА КОМАНД ===\n\n";

// Создаем токен
$jwtService = new JWTService();
$userId = 'user_68c07c01a9bf62.98434149';
$token = $jwtService->generateToken($userId);

echo "1. Тестируем создание команды напрямую\n";
$controller = new TeamController();

// Создаем мок запроса
$request = new class($userId) {
    private $userId;
    
    public function __construct($userId) {
        $this->userId = $userId;
    }
    
    public function getParsedBody() {
        return [
            'name' => 'Тестовая команда',
            'description' => 'Описание тестовой команды',
            'color' => '#3B82F6'
        ];
    }
    
    public function getAttribute($name) {
        if ($name === 'user_id') {
            return $this->userId;
        }
        return null;
    }
};

$response = new class {
    public function getBody() {
        return new class {
            public function write($data) {
                echo "Response: " . $data . "\n";
            }
        };
    }
    
    public function withHeader($name, $value) {
        return $this;
    }
    
    public function withStatus($code) {
        echo "Status: $code\n";
        return $this;
    }
};

try {
    $result = $controller->create($request, $response);
    echo "✅ Команда создана успешно\n";
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
}

echo "\n2. Тестируем получение команд пользователя\n";
try {
    $result = $controller->getUserTeams($request, $response);
    echo "✅ Команды получены успешно\n";
} catch (Exception $e) {
    echo "❌ Ошибка: " . $e->getMessage() . "\n";
}



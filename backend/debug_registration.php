<?php
// Простой скрипт для отладки регистрации
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo "=== DEBUG REGISTRATION ===\n";
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set') . "\n";
echo "Raw input:\n";
$rawInput = file_get_contents('php://input');
echo $rawInput . "\n";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode($rawInput, true);
    echo "Parsed data:\n";
    print_r($data);
    
    if ($data) {
        echo "\nValidation:\n";
        require_once __DIR__ . '/vendor/autoload.php';
        use App\Services\ValidationService;
        use Dotenv\Dotenv;
        
        $dotenv = Dotenv::createImmutable(__DIR__);
        $dotenv->load();
        
        $validator = new ValidationService();
        $errors = $validator->validateRegistration($data);
        
        if (!empty($errors)) {
            echo "Validation errors:\n";
            foreach ($errors as $field => $error) {
                echo "- $field: $error\n";
            }
        } else {
            echo "Validation passed!\n";
        }
    }
}
?>



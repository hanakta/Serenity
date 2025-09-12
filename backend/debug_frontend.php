<?php
// Отладка данных от frontend
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$debug = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'raw_input' => file_get_contents('php://input'),
    'parsed_data' => null,
    'validation_errors' => null
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    $debug['parsed_data'] = $data;
    
    if ($data) {
        require_once __DIR__ . '/vendor/autoload.php';
        use App\Services\ValidationService;
        use Dotenv\Dotenv;
        
        $dotenv = Dotenv::createImmutable(__DIR__);
        $dotenv->load();
        
        $validator = new ValidationService();
        $errors = $validator->validateRegistration($data);
        $debug['validation_errors'] = $errors;
    }
}

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>



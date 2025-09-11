<?php
// 🐱 Middleware для аутентификации в Serenity

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use App\Services\JWTService;

class AuthMiddleware
{
    private JWTService $jwtService;

    public function __construct()
    {   
        $this->jwtService = new JWTService();
    }

    public function __invoke($request, $handler)
    {
        // Получаем токен из заголовка Authorization
        $authHeader = $request->getHeaderLine('Authorization');
        $token = $this->jwtService->extractTokenFromHeader($authHeader);

        if (!$token) {
            return $this->unauthorizedResponse();
        }

        try {
            // Валидируем токен
            $payload = $this->jwtService->validateToken($token);

            // Проверяем, что это access токен
            if (!$this->jwtService->isAccessToken($payload)) {
                return $this->unauthorizedResponse('Недействительный тип токена');
            }

            // Проверяем, не истек ли токен
            if ($this->jwtService->isTokenExpired($payload)) {
                return $this->unauthorizedResponse('Токен истек');
            }

            // Добавляем user_id в атрибуты запроса
            $request = $request->withAttribute('user_id', $payload['user_id']);
            $request = $request->withAttribute('token_payload', $payload);

            return $handler->handle($request);

        } catch (\Exception $e) {
            return $this->unauthorizedResponse('Недействительный токен: ' . $e->getMessage());
        }
    }

    /**
     * Создание ответа с ошибкой авторизации
     */
    private function unauthorizedResponse(string $message = 'Требуется авторизация')
    {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $message,
            'error' => 'Unauthorized'
        ], JSON_UNESCAPED_UNICODE));
        
        return $response
            ->withStatus(401)
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('WWW-Authenticate', 'Bearer');
    }
}

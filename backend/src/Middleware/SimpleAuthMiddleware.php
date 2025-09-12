<?php
// Простой AuthMiddleware без проблем с JWT

namespace App\Middleware;

use App\Services\JWTService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Server\MiddlewareInterface;

class SimpleAuthMiddleware implements MiddlewareInterface
{
    private JWTService $jwtService;

    public function __construct()
    {
        $this->jwtService = new JWTService();
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $authHeader = $request->getHeaderLine('Authorization');
        $token = null;
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            return $this->unauthorizedResponse('Токен не предоставлен');
        }

        try {
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
            error_log('SimpleAuthMiddleware Error: ' . $e->getMessage());
            return $this->unauthorizedResponse('Недействительный токен: ' . $e->getMessage());
        }
    }

    private function unauthorizedResponse(string $message): ResponseInterface
    {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $message,
            'error' => 'Unauthorized'
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
}


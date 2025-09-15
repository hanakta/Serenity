<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use App\Services\JWTService;
use App\Services\ResponseService;

class AuthMiddleware
{
    private $jwtService;
    private $responseService;

    public function __construct()
    {
        $this->jwtService = new JWTService();
        $this->responseService = new ResponseService();
    }

    /**
     * Middleware для проверки аутентификации
     */
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $this->responseService->error('Токен авторизации не найден', 401);
        }

        $token = $matches[1];
        
        try {
            $payload = $this->jwtService->validateToken($token);
            
            // Проверяем валидность payload
            if (!$payload || !isset($payload['user_id']) || empty($payload['user_id'])) {
                return $this->responseService->error('Недействительный токен', 401);
            }
            
            // Проверяем, что токен не истек
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return $this->responseService->error('Токен истек', 401);
            }
            
            // Добавляем информацию о пользователе в атрибуты запроса
            $request = $request->withAttribute('user_id', $payload['user_id']);
            $request = $request->withAttribute('user_payload', $payload);
            
            return $handler->handle($request);
            
        } catch (\Exception $e) {
            error_log("Auth middleware error: " . $e->getMessage());
            return $this->responseService->error('Ошибка аутентификации', 401);
        }
    }

    /**
     * Получить ID пользователя из запроса
     */
    public static function getUserId($request)
    {
        return $request->getAttribute('user_id');
    }

    /**
     * Получить payload пользователя из запроса
     */
    public static function getUserPayload($request)
    {
        return $request->getAttribute('user_payload');
    }
}
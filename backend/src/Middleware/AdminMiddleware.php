<?php
// 🐱 Middleware для проверки прав администратора

namespace App\Middleware;

use App\Models\User;
use App\Services\JWTService;
use App\Services\ResponseService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class AdminMiddleware
{
    private JWTService $jwtService;
    private User $userModel;
    private ResponseService $responseService;

    public function __construct()
    {
        $this->jwtService = new JWTService();
        $this->userModel = new User();
        $this->responseService = new ResponseService();
    }

    /**
     * Проверить права администратора
     */
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        try {
            // Получаем токен из заголовка Authorization
            $authHeader = $request->getHeaderLine('Authorization');
            
            if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $this->responseService->error('Токен доступа не предоставлен', 401);
            }

            $token = $matches[1];
            
            // Проверяем токен
            $payload = $this->jwtService->validateToken($token);
            
            if (!$payload) {
                return $this->responseService->error('Недействительный токен', 401);
            }

            $userId = $payload['user_id'] ?? null;
            
            if (!$userId) {
                return $this->responseService->error('Недействительный токен', 401);
            }

            // Проверяем, является ли пользователь администратором
            if (!$this->userModel->isAdmin($userId)) {
                return $this->responseService->error('Недостаточно прав доступа', 403);
            }

            // Добавляем информацию о пользователе в атрибуты запроса
            $user = $this->userModel->findById($userId);
            $request = $request->withAttribute('user', $user);
            $request = $request->withAttribute('user_id', $userId);

            return $handler->handle($request);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка проверки прав доступа: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Проверить права супер-администратора
     */
    public function superAdminOnly(Request $request, RequestHandler $handler): Response
    {
        try {
            // Получаем токен из заголовка Authorization
            $authHeader = $request->getHeaderLine('Authorization');
            
            if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $this->responseService->error('Токен доступа не предоставлен', 401);
            }

            $token = $matches[1];
            
            // Проверяем токен
            $payload = $this->jwtService->validateToken($token);
            
            if (!$payload) {
                return $this->responseService->error('Недействительный токен', 401);
            }

            $userId = $payload['user_id'] ?? null;
            
            if (!$userId) {
                return $this->responseService->error('Недействительный токен', 401);
            }

            // Проверяем, является ли пользователь супер-администратором
            if (!$this->userModel->isSuperAdmin($userId)) {
                return $this->responseService->error('Недостаточно прав доступа. Требуются права супер-администратора', 403);
            }

            // Добавляем информацию о пользователе в атрибуты запроса
            $user = $this->userModel->findById($userId);
            $request = $request->withAttribute('user', $user);
            $request = $request->withAttribute('user_id', $userId);

            return $handler->handle($request);

        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка проверки прав доступа: ' . $e->getMessage(), 500);
        }
    }
}


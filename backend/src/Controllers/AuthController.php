<?php
// 🐱 Контроллер аутентификации для Serenity

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Services\JWTService;
use App\Services\ValidationService;

class AuthController
{
    private User $userModel;
    private JWTService $jwtService;
    private ValidationService $validator;

    public function __construct()
    {
        $this->userModel = new User();
        $this->jwtService = new JWTService();
        $this->validator = new ValidationService();
    }

    /**
     * Регистрация нового пользователя
     */
    public function register($request, $response)
    {
        $data = $request->getParsedBody();

        // Валидация данных
        $errors = $this->validator->validateRegistration($data);
        if (!empty($errors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $errors
            ], 400);
        }

        // Проверка существования пользователя
        if ($this->userModel->findByEmail($data['email'])) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Пользователь с таким email уже существует'
            ], 409);
        }

        try {
            // Создание пользователя
            $user = $this->userModel->create($data);
            
            // Если у пользователя есть аватарка в базе данных, устанавливаем URL для получения
            if ($user['avatar_data']) {
                $user['avatar'] = 'http://localhost:8000/api/profile/avatar';
            }

            // Убираем большие поля из ответа для экономии трафика
            unset($user['avatar_data']);
            
            // Генерация JWT токена
            $token = $this->jwtService->generateToken($user['id']);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Пользователь успешно зарегистрирован',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при создании пользователя: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Вход пользователя
     */
    public function login($request, $response)
    {
        $data = $request->getParsedBody();

        // Валидация данных
        $errors = $this->validator->validateLogin($data);
        if (!empty($errors)) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибки валидации',
                'errors' => $errors
            ], 400);
        }

        try {
            // Проверка учетных данных
            $user = $this->userModel->verifyPassword($data['email'], $data['password']);
            
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Неверный email или пароль'
                ], 401);
            }

            // Если у пользователя есть аватарка в базе данных, устанавливаем URL для получения
            if ($user['avatar_data']) {
                $user['avatar'] = 'http://localhost:8000/api/profile/avatar';
            }

            // Убираем большие поля из ответа для экономии трафика
            unset($user['avatar_data']);

            // Генерация JWT токена
            $token = $this->jwtService->generateToken($user['id']);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Успешный вход в систему',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при входе: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Выход пользователя
     */
    public function logout($request, $response)
    {
        // В реальном приложении здесь можно добавить логику
        // для добавления токена в черный список
        return $this->jsonResponse($response, [
            'success' => true,
            'message' => 'Успешный выход из системы'
        ]);
    }

    /**
     * Обновление токена
     */
    public function refresh($request, $response)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        $token = str_replace('Bearer ', '', $authHeader);

        try {
            $payload = $this->jwtService->validateToken($token);
            $newToken = $this->jwtService->generateToken($payload['user_id']);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Токен обновлен',
                'data' => [
                    'token' => $newToken
                ]
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Недействительный токен'
            ], 401);
        }
    }

    /**
     * Получение информации о текущем пользователе
     */
    public function me($request, $response)
    {
        $userId = $request->getAttribute('user_id');
        
        try {
            $user = $this->userModel->findById($userId);
            
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Пользователь не найден'
                ], 404);
            }

            // Если у пользователя есть аватарка в базе данных, устанавливаем URL для получения
            if ($user['avatar_data']) {
                $user['avatar'] = 'http://localhost:8000/api/profile/avatar';
            }

            // Убираем большие поля из ответа для экономии трафика
            unset($user['avatar_data']);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Ошибка при получении данных пользователя: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Вспомогательный метод для JSON ответов
     */
    private function jsonResponse($response, array $data, int $statusCode = 200)
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
    }
}

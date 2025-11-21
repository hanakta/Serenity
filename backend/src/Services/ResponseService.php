<?php

namespace App\Services;

use Psr\Http\Message\ResponseInterface as Response;
use Slim\Psr7\Response as SlimResponse;

class ResponseService
{
    /**
     * Успешный ответ
     */
    public function success($data = null, $message = 'Success', $statusCode = 200): Response
    {
        $response = new SlimResponse();
        
        $responseData = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $response->getBody()->write(json_encode($responseData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }

    /**
     * Ошибка
     */
    public function error($message = 'Error', $statusCode = 400, $errors = null): Response
    {
        $response = new SlimResponse();
        
        $responseData = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if ($errors !== null) {
            $responseData['errors'] = $errors;
        }

        $response->getBody()->write(json_encode($responseData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }

    /**
     * Валидационная ошибка
     */
    public function validationError($errors, $message = 'Validation failed'): Response
    {
        return $this->error($message, 422, $errors);
    }

    /**
     * Неавторизованный доступ
     */
    public function unauthorized($message = 'Unauthorized'): Response
    {
        return $this->error($message, 401);
    }

    /**
     * Запрещенный доступ
     */
    public function forbidden($message = 'Forbidden'): Response
    {
        return $this->error($message, 403);
    }

    /**
     * Не найдено
     */
    public function notFound($message = 'Not found'): Response
    {
        return $this->error($message, 404);
    }

    /**
     * Внутренняя ошибка сервера
     */
    public function serverError($message = 'Internal server error'): Response
    {
        return $this->error($message, 500);
    }
}






















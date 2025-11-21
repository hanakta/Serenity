<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class CorsMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        // Получаем Origin из запроса
        $origin = $request->getHeaderLine('Origin');
        $allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://192.168.0.113:3000',
            'http://192.168.0.113:3001',
            'http://172.20.10.4:3000',
            'http://172.20.10.4:3001',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'http://192.168.0.113:8000',
            'http://172.20.10.4:8000'
        ];
        
        // Разрешаем все локальные IP адреса для разработки
        if (preg_match('/^http:\/\/192\.168\.\d+\.\d+:\d+$/', $origin)) {
            $allowedOrigin = $origin;
        } elseif (preg_match('/^http:\/\/172\.\d+\.\d+\.\d+:\d+$/', $origin)) {
            $allowedOrigin = $origin;
        } elseif (preg_match('/^http:\/\/localhost:\d+$/', $origin)) {
            $allowedOrigin = $origin;
        } elseif (preg_match('/^http:\/\/127\.0\.0\.1:\d+$/', $origin)) {
            $allowedOrigin = $origin;
        } else {
            // Если Origin разрешен, используем его, иначе используем первый разрешенный
            $allowedOrigin = in_array($origin, $allowedOrigins) ? $origin : $allowedOrigins[0];
        }

        // Handle preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $response = new \Slim\Psr7\Response();
            return $response
                ->withHeader('Access-Control-Allow-Origin', $allowedOrigin)
                ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->withHeader('Access-Control-Allow-Credentials', 'true')
                ->withHeader('Access-Control-Max-Age', '86400')
                ->withStatus(200);
        }

        $response = $handler->handle($request);

        return $response
            ->withHeader('Access-Control-Allow-Origin', $allowedOrigin)
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->withHeader('Access-Control-Allow-Credentials', 'true');
    }
}
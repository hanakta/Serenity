<?php
// 🐱 Сервис для работы с JWT токенами в Serenity

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class JWTService
{
    private string $secret;
    private string $algorithm;
    private int $expiration;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'your-super-secret-jwt-key-here';
        $this->algorithm = $_ENV['JWT_ALGORITHM'] ?? 'HS256';
        $this->expiration = (int) ($_ENV['JWT_EXPIRATION'] ?? 86400); // 24 часа по умолчанию
    }

    /**
     * Генерация JWT токена
     */
    public function generateToken(string $userId, array $additionalClaims = []): string
    {
        $now = time();
        
        $payload = [
            'iss' => 'serenity-api', // Issuer
            'aud' => 'serenity-app', // Audience
            'iat' => $now, // Issued at
            'exp' => $now + $this->expiration, // Expiration time
            'user_id' => $userId,
            'type' => 'access'
        ];

        // Добавляем дополнительные claims
        $payload = array_merge($payload, $additionalClaims);

        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    /**
     * Генерация refresh токена
     */
    public function generateRefreshToken(string $userId): string
    {
        $now = time();
        
        $payload = [
            'iss' => 'serenity-api',
            'aud' => 'serenity-app',
            'iat' => $now,
            'exp' => $now + (30 * 24 * 60 * 60), // 30 дней
            'user_id' => $userId,
            'type' => 'refresh'
        ];

        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    /**
     * Валидация и декодирование токена
     */
    public function validateToken(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            throw new \Exception('Токен истек');
        } catch (SignatureInvalidException $e) {
            throw new \Exception('Недействительная подпись токена');
        } catch (\Exception $e) {
            throw new \Exception('Недействительный токен: ' . $e->getMessage());
        }
    }

    /**
     * Извлечение токена из заголовка Authorization
     */
    public function extractTokenFromHeader(string $authHeader): ?string
    {
        if (empty($authHeader)) {
            return null;
        }

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Проверка типа токена
     */
    public function isAccessToken(array $payload): bool
    {
        return isset($payload['type']) && $payload['type'] === 'access';
    }

    /**
     * Проверка типа refresh токена
     */
    public function isRefreshToken(array $payload): bool
    {
        return isset($payload['type']) && $payload['type'] === 'refresh';
    }

    /**
     * Получение времени истечения токена
     */
    public function getTokenExpiration(array $payload): int
    {
        return $payload['exp'] ?? 0;
    }

    /**
     * Проверка, истек ли токен
     */
    public function isTokenExpired(array $payload): bool
    {
        $exp = $this->getTokenExpiration($payload);
        return $exp < time();
    }

    /**
     * Получение времени до истечения токена в секундах
     */
    public function getTimeUntilExpiration(array $payload): int
    {
        $exp = $this->getTokenExpiration($payload);
        $timeLeft = $exp - time();
        return max(0, $timeLeft);
    }

    /**
     * Генерация пары токенов (access + refresh)
     */
    public function generateTokenPair(string $userId, array $additionalClaims = []): array
    {
        return [
            'access_token' => $this->generateToken($userId, $additionalClaims),
            'refresh_token' => $this->generateRefreshToken($userId),
            'expires_in' => $this->expiration,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Обновление access токена с помощью refresh токена
     */
    public function refreshAccessToken(string $refreshToken): array
    {
        $payload = $this->validateToken($refreshToken);
        
        if (!$this->isRefreshToken($payload)) {
            throw new \Exception('Недействительный refresh токен');
        }

        $userId = $payload['user_id'];
        return $this->generateTokenPair($userId);
    }
}

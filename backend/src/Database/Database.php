<?php
// 🐱 Класс для работы с базой данных Serenity

namespace App\Database;

use PDO;
use PDOException;

class Database
{
    private static ?self $instance = null;
    private PDO $connection;

    private function __construct()
    {
        $this->connect();
    }

    /**
     * Получить экземпляр базы данных (Singleton)
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Подключение к базе данных
     */
    private function connect(): void
    {
        // Загружаем конфигурацию базы данных
        $config = require __DIR__ . '/../../config/database.php';
        
        // Формируем DSN в зависимости от драйвера
        if ($config['driver'] === 'sqlite') {
            $dsn = "sqlite:" . $config['database'];
        } else {
            // MySQL конфигурация
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
            
            // Добавляем unix_socket для MAMP если нужно
            if (isset($config['unix_socket'])) {
                $dsn .= ";unix_socket={$config['unix_socket']}";
            }
        }

        try {
            if ($config['driver'] === 'sqlite') {
                $this->connection = new PDO($dsn, null, null, $config['options']);
            } else {
                $this->connection = new PDO($dsn, $config['username'], $config['password'], $config['options']);
            }
        } catch (PDOException $e) {
            throw new \Exception("Ошибка подключения к базе данных: " . $e->getMessage());
        }
    }

    /**
     * Получить PDO соединение
     */
    public function getConnection(): PDO
    {
        return $this->connection;
    }

    /**
     * Выполнить запрос и вернуть результат
     */
    public function query(string $sql, array $params = []): array
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new \Exception("Ошибка выполнения запроса: " . $e->getMessage());
        }
    }

    /**
     * Выполнить запрос и вернуть одну запись
     */
    public function queryOne(string $sql, array $params = []): ?array
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            throw new \Exception("Ошибка выполнения запроса: " . $e->getMessage());
        }
    }

    /**
     * Выполнить запрос без возврата данных (INSERT, UPDATE, DELETE)
     */
    public function execute(string $sql, array $params = []): int
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new \Exception("Ошибка выполнения запроса: " . $e->getMessage());
        }
    }

    /**
     * Получить ID последней вставленной записи
     */
    public function lastInsertId(): string
    {
        return $this->connection->lastInsertId();
    }

    /**
     * Начать транзакцию
     */
    public function beginTransaction(): bool
    {
        return $this->connection->beginTransaction();
    }

    /**
     * Подтвердить транзакцию
     */
    public function commit(): bool
    {
        return $this->connection->commit();
    }

    /**
     * Откатить транзакцию
     */
    public function rollback(): bool
    {
        return $this->connection->rollback();
    }

    /**
     * Проверить подключение к базе данных
     */
    public function isConnected(): bool
    {
        try {
            $this->connection->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * Получить информацию о базе данных
     */
    public function getInfo(): array
    {
        return [
            'version' => $this->connection->getAttribute(PDO::ATTR_SERVER_VERSION),
            'driver' => $this->connection->getAttribute(PDO::ATTR_DRIVER_NAME),
            'connected' => $this->isConnected()
        ];
    }
}


<?php
// 🐱 Конфигурация базы данных для Serenity

return [
    'driver' => 'sqlite',
    'database' => __DIR__ . '/../database/serenity.db',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];

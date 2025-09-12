<?php
// 🐱 Сервис валидации для Serenity

namespace App\Services;

class ValidationService
{
    /**
     * Валидация данных регистрации
     */
    public function validateRegistration(array $data): array
    {
        $errors = [];

        // Валидация email
        if (empty($data['email'])) {
            $errors['email'] = 'Email обязателен';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Некорректный формат email';
        }

        // Валидация имени
        if (empty($data['name'])) {
            $errors['name'] = 'Имя обязательно';
        } elseif (strlen($data['name']) < 2) {
            $errors['name'] = 'Имя должно содержать минимум 2 символа';
        } elseif (strlen($data['name']) > 100) {
            $errors['name'] = 'Имя не должно превышать 100 символов';
        }

        // Валидация пароля
        if (empty($data['password'])) {
            $errors['password'] = 'Пароль обязателен';
        } elseif (strlen($data['password']) < 8) {
            $errors['password'] = 'Пароль должен содержать минимум 8 символов';
        } elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $data['password'])) {
            $errors['password'] = 'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру';
        }

        // Валидация подтверждения пароля
        if (empty($data['confirmPassword'])) {
            $errors['confirmPassword'] = 'Подтверждение пароля обязательно';
        } elseif ($data['password'] !== $data['confirmPassword']) {
            $errors['confirmPassword'] = 'Пароли не совпадают';
        }

        return $errors;
    }

    /**
     * Валидация данных входа
     */
    public function validateLogin(array $data): array
    {
        $errors = [];

        if (empty($data['email'])) {
            $errors['email'] = 'Email обязателен';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Некорректный формат email';
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Пароль обязателен';
        }

        return $errors;
    }

    /**
     * Валидация данных задачи
     */
    public function validateTask(array $data): array
    {
        $errors = [];

        // Валидация заголовка
        if (empty($data['title'])) {
            $errors['title'] = 'Заголовок задачи обязателен';
        } elseif (strlen($data['title']) > 500) {
            $errors['title'] = 'Заголовок не должен превышать 500 символов';
        }

        // Валидация описания
        if (isset($data['description']) && strlen($data['description']) > 2000) {
            $errors['description'] = 'Описание не должно превышать 2000 символов';
        }

        // Валидация статуса
        if (isset($data['status'])) {
            $validStatuses = ['todo', 'in_progress', 'completed', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                $errors['status'] = 'Некорректный статус задачи';
            }
        }

        // Валидация приоритета
        if (isset($data['priority'])) {
            $validPriorities = ['low', 'medium', 'high', 'urgent'];
            if (!in_array($data['priority'], $validPriorities)) {
                $errors['priority'] = 'Некорректный приоритет задачи';
            }
        }

        // Валидация категории
        if (isset($data['category'])) {
            $validCategories = ['personal', 'work', 'health', 'learning', 'shopping', 'other'];
            if (!in_array($data['category'], $validCategories)) {
                $errors['category'] = 'Некорректная категория задачи';
            }
        }

        // Валидация даты выполнения
        if (isset($data['due_date']) && !empty($data['due_date'])) {
            $dueDate = strtotime($data['due_date']);
            if ($dueDate === false) {
                $errors['due_date'] = 'Некорректный формат даты';
            }
            // Убираем проверку на прошлое время, так как пользователь может создавать задачи с прошедшими датами
        }

        // Валидация тегов
        if (isset($data['tags']) && is_array($data['tags'])) {
            foreach ($data['tags'] as $tag) {
                if (!is_string($tag) || strlen($tag) > 100) {
                    $errors['tags'] = 'Некорректные теги';
                    break;
                }
            }
        }

        return $errors;
    }

    /**
     * Валидация данных проекта
     */
    public function validateProject(array $data): array
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Название проекта обязательно';
        } elseif (strlen($data['name']) > 255) {
            $errors['name'] = 'Название не должно превышать 255 символов';
        }

        if (isset($data['description']) && strlen($data['description']) > 1000) {
            $errors['description'] = 'Описание не должно превышать 1000 символов';
        }

        if (isset($data['color']) && !preg_match('/^#[0-9A-Fa-f]{6}$/', $data['color'])) {
            $errors['color'] = 'Некорректный формат цвета';
        }

        return $errors;
    }

    /**
     * Валидация данных пользователя
     */
    public function validateUserUpdate(array $data): array
    {
        $errors = [];

        if (isset($data['name'])) {
            if (empty($data['name'])) {
                $errors['name'] = 'Имя не может быть пустым';
            } elseif (strlen($data['name']) < 2) {
                $errors['name'] = 'Имя должно содержать минимум 2 символа';
            } elseif (strlen($data['name']) > 100) {
                $errors['name'] = 'Имя не должно превышать 100 символов';
            }
        }

        if (isset($data['email'])) {
            if (empty($data['email'])) {
                $errors['email'] = 'Email обязателен';
            } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Некорректный формат email';
            }
        }

        if (isset($data['password'])) {
            if (strlen($data['password']) < 8) {
                $errors['password'] = 'Пароль должен содержать минимум 8 символов';
            } elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $data['password'])) {
                $errors['password'] = 'Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру';
            }
        }

        if (isset($data['avatar']) && !filter_var($data['avatar'], FILTER_VALIDATE_URL)) {
            $errors['avatar'] = 'Некорректный URL аватара';
        }

        return $errors;
    }

    /**
     * Валидация создания команды
     */
    public function validateTeamCreation(array $data): array
    {
        $errors = [];

        // Валидация названия команды
        if (empty($data['name'])) {
            $errors['name'] = 'Название команды обязательно';
        } elseif (strlen($data['name']) < 2) {
            $errors['name'] = 'Название команды должно содержать минимум 2 символа';
        } elseif (strlen($data['name']) > 255) {
            $errors['name'] = 'Название команды не должно превышать 255 символов';
        }

        // Валидация описания
        if (isset($data['description']) && strlen($data['description']) > 1000) {
            $errors['description'] = 'Описание не должно превышать 1000 символов';
        }

        // Валидация цвета
        if (isset($data['color']) && !preg_match('/^#[0-9A-Fa-f]{6}$/', $data['color'])) {
            $errors['color'] = 'Некорректный формат цвета (должен быть #RRGGBB)';
        }

        return $errors;
    }

    /**
     * Валидация пагинации
     */
    public function validatePagination(array $data): array
    {
        $errors = [];

        if (isset($data['page'])) {
            $page = (int) $data['page'];
            if ($page < 1) {
                $errors['page'] = 'Номер страницы должен быть больше 0';
            }
        }

        if (isset($data['limit'])) {
            $limit = (int) $data['limit'];
            if ($limit < 1 || $limit > 100) {
                $errors['limit'] = 'Лимит должен быть от 1 до 100';
            }
        }

        return $errors;
    }

    /**
     * Валидация UUID
     */
    public function validateUUID(string $uuid): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid) === 1;
    }

    /**
     * Валидация ID задачи (поддерживает как UUID, так и task_xxx формат)
     */
    public function validateTaskId(string $taskId): bool
    {
        // UUID формат
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $taskId) === 1) {
            return true;
        }
        
        // task_xxx формат
        if (preg_match('/^task_[a-f0-9]+\.[0-9]+$/', $taskId) === 1) {
            return true;
        }
        
        // Другие форматы ID (например, task_1_123)
        if (preg_match('/^task_\d+_\d+$/', $taskId) === 1) {
            return true;
        }
        
        return false;
    }

    /**
     * Валидация данных для обновления задачи (все поля опциональны)
     */
    public function validateTaskUpdate(array $data): array
    {
        $errors = [];

        // Валидация заголовка (если передан)
        if (isset($data['title'])) {
            if (empty($data['title'])) {
                $errors['title'] = 'Заголовок задачи не может быть пустым';
            } elseif (strlen($data['title']) > 500) {
                $errors['title'] = 'Заголовок не должен превышать 500 символов';
            }
        }

        // Валидация описания (если передано)
        if (isset($data['description']) && strlen($data['description']) > 2000) {
            $errors['description'] = 'Описание не должно превышать 2000 символов';
        }

        // Валидация статуса (если передан)
        if (isset($data['status'])) {
            $validStatuses = ['todo', 'in_progress', 'completed', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                $errors['status'] = 'Некорректный статус задачи';
            }
        }

        // Валидация приоритета (если передан)
        if (isset($data['priority'])) {
            $validPriorities = ['low', 'medium', 'high', 'urgent'];
            if (!in_array($data['priority'], $validPriorities)) {
                $errors['priority'] = 'Некорректный приоритет задачи';
            }
        }

        // Валидация категории (если передана)
        if (isset($data['category'])) {
            $validCategories = ['personal', 'work', 'health', 'learning', 'shopping', 'other'];
            if (!in_array($data['category'], $validCategories)) {
                $errors['category'] = 'Некорректная категория задачи';
            }
        }

        // Валидация даты выполнения (если передана)
        if (isset($data['due_date'])) {
            if ($data['due_date'] !== null && !strtotime($data['due_date'])) {
                $errors['due_date'] = 'Некорректная дата выполнения';
            }
        }

        return $errors;
    }


    /**
     * Валидация обновления профиля
     */
    public function validateProfileUpdate(array $data): array
    {
        $errors = [];

        if (isset($data['name'])) {
            if (empty(trim($data['name']))) {
                $errors['name'] = 'Имя не может быть пустым';
            } elseif (strlen(trim($data['name'])) < 2) {
                $errors['name'] = 'Имя должно содержать минимум 2 символа';
            } elseif (strlen(trim($data['name'])) > 100) {
                $errors['name'] = 'Имя не должно превышать 100 символов';
            }
        }

        if (isset($data['email'])) {
            if (empty(trim($data['email']))) {
                $errors['email'] = 'Email обязателен';
            } elseif (!filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Некорректный формат email';
            }
        }

        if (isset($data['password'])) {
            if (strlen($data['password']) < 6) {
                $errors['password'] = 'Пароль должен содержать минимум 6 символов';
            } elseif (strlen($data['password']) > 100) {
                $errors['password'] = 'Пароль не должен превышать 100 символов';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Валидация смены пароля
     */
    public function validatePasswordChange(array $data): array
    {
        $errors = [];

        if (empty($data['current_password'])) {
            $errors['current_password'] = 'Текущий пароль обязателен';
        }

        if (empty($data['new_password'])) {
            $errors['new_password'] = 'Новый пароль обязателен';
        } elseif (strlen($data['new_password']) < 8) {
            $errors['new_password'] = 'Новый пароль должен содержать минимум 8 символов';
        } elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $data['new_password'])) {
            $errors['new_password'] = 'Новый пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру';
        }

        if (isset($data['new_password']) && isset($data['current_password']) && $data['new_password'] === $data['current_password']) {
            $errors['new_password'] = 'Новый пароль должен отличаться от текущего';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Валидация файла изображения
     */
    public function validateImageFile(array $file): array
    {
        $errors = [];

        // Проверяем, что файл был загружен
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            $errors['file'] = 'Файл не был загружен';
            return ['valid' => false, 'errors' => $errors];
        }

        // Проверяем ошибки загрузки
        if (isset($file['error']) && $file['error'] !== UPLOAD_ERR_OK) {
            $errors['file'] = 'Ошибка загрузки файла';
            return ['valid' => false, 'errors' => $errors];
        }

        // Проверяем размер файла (максимум 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            $errors['file'] = 'Размер файла не должен превышать 5MB';
        }

        // Проверяем тип файла
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = mime_content_type($file['tmp_name']);
        
        if (!in_array($fileType, $allowedTypes)) {
            $errors['file'] = 'Разрешены только изображения в форматах JPEG, PNG, GIF, WebP';
        }

        // Проверяем расширение файла
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($fileExtension, $allowedExtensions)) {
            $errors['file'] = 'Некорректное расширение файла';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Санитизация строки
     */
    public function sanitizeString(string $string): string
    {
        return trim(htmlspecialchars($string, ENT_QUOTES, 'UTF-8'));
    }

    /**
     * Валидация и санитизация массива строк
     */
    public function sanitizeStringArray(array $strings): array
    {
        return array_map([$this, 'sanitizeString'], $strings);
    }


    /**
     * Валидация приглашения в команду
     */
    public function validateTeamInvitation(array $data): array
    {
        $errors = [];

        // Валидация email
        if (empty($data['email'])) {
            $errors['email'] = 'Email обязателен';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Некорректный формат email';
        }

        // Валидация роли
        if (!empty($data['role']) && !in_array($data['role'], ['admin', 'member', 'viewer'])) {
            $errors['role'] = 'Некорректная роль. Доступные роли: admin, member, viewer';
        }

        return $errors;
    }

    /**
     * Валидация комментария к задаче
     */
    public function validateTaskComment(array $data): array
    {
        $errors = [];

        // Валидация содержимого комментария
        if (empty($data['content'])) {
            $errors['content'] = 'Содержимое комментария обязательно';
        } elseif (strlen($data['content']) < 1) {
            $errors['content'] = 'Комментарий не может быть пустым';
        } elseif (strlen($data['content']) > 1000) {
            $errors['content'] = 'Комментарий не должен превышать 1000 символов';
        }

        // Валидация ID задачи
        if (empty($data['task_id'])) {
            $errors['task_id'] = 'ID задачи обязателен';
        }

        return $errors;
    }
}

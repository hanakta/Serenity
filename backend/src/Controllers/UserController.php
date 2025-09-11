<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\ValidationService;
use App\Services\ResponseService;
use App\Services\FileService;

class UserController
{
    private $userModel;
    private $validationService;
    private $responseService;
    private $fileService;

    public function __construct()
    {
        $this->userModel = new User();
        $this->validationService = new ValidationService();
        $this->responseService = new ResponseService();
        $this->fileService = new FileService();
    }

    /**
     * Получить профиль пользователя
     */
    public function getProfile($request, $response)
    {
        try {
            $userId = $request->getAttribute('user_id');
            $user = $this->userModel->findById($userId);
            
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Убираем пароль из ответа
            unset($user['password_hash']);

            return $this->responseService->success([
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения профиля: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Обновить профиль пользователя
     */
    public function updateProfile($request, $response)
    {
        try {
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();
            
            // Валидация данных
            $validation = $this->validationService->validateProfileUpdate($data);
            if (!$validation['valid']) {
                return $this->responseService->error('Ошибки валидации', 400, $validation['errors']);
            }

            // Проверяем, существует ли пользователь
            $user = $this->userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Подготавливаем данные для обновления
            $updateData = [];
            
            if (isset($data['name'])) {
                $updateData['name'] = trim($data['name']);
            }

            if (isset($data['email'])) {
                // Проверяем, не занят ли email другим пользователем
                $existingUser = $this->userModel->findByEmail($data['email']);
                if ($existingUser && $existingUser['id'] !== $userId) {
                    return $this->responseService->error('Email уже используется другим пользователем', 409);
                }
                $updateData['email'] = trim($data['email']);
            }

            if (isset($data['password'])) {
                $updateData['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            // Обновляем пользователя
            $updated = $this->userModel->update($userId, $updateData);
            
            if (!$updated) {
                return $this->responseService->error('Не удалось обновить профиль', 500);
            }

            // Получаем обновленные данные пользователя
            $updatedUser = $this->userModel->findById($userId);
            unset($updatedUser['password_hash']);

            return $this->responseService->success([
                'user' => $updatedUser,
                'message' => 'Профиль успешно обновлен'
            ]);
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка обновления профиля: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Загрузить аватар пользователя
     */
    public function uploadAvatar($request, $response)
    {
        try {
            $userId = $request->getAttribute('user_id');
            
            // Проверяем, существует ли пользователь
            $user = $this->userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Получаем загруженный файл
            $files = $request->getUploadedFiles();
            if (empty($files['avatar'])) {
                return $this->responseService->error('Файл не был загружен', 400);
            }

            $file = $files['avatar'];

            // Подготавливаем данные файла для валидации
            $fileData = [
                'name' => $file->getClientFilename(),
                'type' => $file->getClientMediaType(),
                'size' => $file->getSize(),
                'tmp_name' => $file->getStream()->getMetadata('uri'),
                'error' => UPLOAD_ERR_OK // Файл уже загружен, ошибок нет
            ];

            // Валидация файла
            $validation = $this->validationService->validateImageFile($fileData);
            if (!$validation['valid']) {
                return $this->responseService->error('Ошибка валидации файла', 400, $validation['errors']);
            }

            // Загружаем файл
            $uploadResult = $this->fileService->uploadImage($fileData, 'avatars');
            if (!$uploadResult['success']) {
                return $this->responseService->error('Ошибка загрузки файла: ' . $uploadResult['error'], 500);
            }

            // Обновляем аватар в базе данных
            $updated = $this->userModel->update($userId, [
                'avatar' => $uploadResult['url']
            ]);

            if (!$updated) {
                // Удаляем загруженный файл, если не удалось обновить БД
                $this->fileService->deleteFile($uploadResult['path']);
                return $this->responseService->error('Не удалось обновить аватар', 500);
            }

            // Получаем обновленные данные пользователя
            $updatedUser = $this->userModel->findById($userId);
            unset($updatedUser['password_hash']);

            return $this->responseService->success([
                'user' => $updatedUser,
                'avatar_url' => $uploadResult['url'],
                'message' => 'Аватар успешно загружен'
            ]);
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка загрузки аватара: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Удалить аватар пользователя
     */
    public function deleteAvatar($request, $response)
    {
        try {
            $userId = $request->getAttribute('user_id');
            
            // Проверяем, существует ли пользователь
            $user = $this->userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Удаляем старый аватар, если он есть
            if ($user['avatar']) {
                $this->fileService->deleteFileByUrl($user['avatar']);
            }

            // Обновляем аватар в базе данных
            $updated = $this->userModel->update($userId, [
                'avatar' => null
            ]);

            if (!$updated) {
                return $this->responseService->error('Не удалось удалить аватар', 500);
            }

            // Получаем обновленные данные пользователя
            $updatedUser = $this->userModel->findById($userId);
            unset($updatedUser['password_hash']);

            return $this->responseService->success([
                'user' => $updatedUser,
                'message' => 'Аватар успешно удален'
            ]);
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления аватара: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Изменить пароль пользователя
     */
    public function changePassword($request, $response)
    {
        try {
            $userId = $request->getAttribute('user_id');
            $data = $request->getParsedBody();
            
            // Валидация данных
            $validation = $this->validationService->validatePasswordChange($data);
            if (!$validation['valid']) {
                return $this->responseService->error('Ошибки валидации', 400, $validation['errors']);
            }

            // Проверяем, существует ли пользователь
            $user = $this->userModel->findById($userId);
            if (!$user) {
                return $this->responseService->error('Пользователь не найден', 404);
            }

            // Проверяем текущий пароль
            if (!password_verify($data['current_password'], $user['password_hash'])) {
                return $this->responseService->error('Неверный текущий пароль', 401);
            }

            // Обновляем пароль
            $updated = $this->userModel->update($userId, [
                'password_hash' => password_hash($data['new_password'], PASSWORD_DEFAULT)
            ]);

            if (!$updated) {
                return $this->responseService->error('Не удалось изменить пароль', 500);
            }

            return $this->responseService->success([
                'message' => 'Пароль успешно изменен'
            ]);
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка изменения пароля: ' . $e->getMessage(), 500);
        }
    }
}
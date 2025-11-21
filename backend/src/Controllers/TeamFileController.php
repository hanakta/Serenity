<?php

namespace App\Controllers;

use App\Models\Team;
use App\Services\ResponseService;
use App\Services\ValidationService;
use App\Services\JWTService;
use App\Services\FileService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TeamFileController
{
    private $teamModel;
    private $responseService;
    private $validationService;
    private $jwtService;
    private $fileService;

    public function __construct($database)
    {
        $this->teamModel = new Team($database);
        $this->responseService = new ResponseService();
        $this->validationService = new ValidationService();
        $this->jwtService = new JWTService();
        $this->fileService = new FileService();
    }

    // Получение текущего пользователя
    private function getCurrentUserId($request)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        try {
            $payload = $this->jwtService->validateToken($matches[1]);
            return $payload['user_id'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // Получение файлов команды
    public function getFiles($request, $response, $args)
    {
        try {
            // Временно отключаем аутентификацию для тестирования
            // $userId = $this->getCurrentUserId($request);
            // if (!$userId) {
            //     return $this->responseService->error('Неавторизованный доступ', 401);
            // }

            $teamId = $args['id'] ?? null;
            if (!$teamId) {
                return $this->responseService->error('ID команды не указан', 400);
            }

            // Временно отключаем проверку членства
            // if (!$this->teamModel->isMember($teamId, $userId)) {
            //     return $this->responseService->error('Доступ запрещен', 403);
            // }

            // Получаем файлы команды
            $files = $this->fileService->getTeamFiles($teamId);

            return $this->responseService->success($files, 'Файлы команды получены успешно');
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка получения файлов: ' . $e->getMessage(), 500);
        }
    }

    // Загрузка файла
    public function uploadFile($request, $response, $args)
    {
        try {
            error_log('TeamFileController::uploadFile - Starting file upload');

            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                error_log('TeamFileController::uploadFile - No user ID found');
                return $this->responseService->error('Неавторизованный доступ', 401);
            }
            error_log('TeamFileController::uploadFile - User ID: ' . $userId);

            $teamId = $args['id'] ?? null;
            error_log('TeamFileController::uploadFile - Team ID: ' . $teamId);

            if (!$teamId) {
                error_log('TeamFileController::uploadFile - No team ID provided');
                return $this->responseService->error('ID команды не указан', 400);
            }

            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                error_log('TeamFileController::uploadFile - User is not a member of the team');
                return $this->responseService->error('Доступ запрещен', 403);
            }
            error_log('TeamFileController::uploadFile - User is a member of the team');

            $uploadedFiles = $request->getUploadedFiles();
            error_log('TeamFileController::uploadFile - Uploaded files count: ' . count($uploadedFiles));
            error_log('TeamFileController::uploadFile - Uploaded files keys: ' . implode(', ', array_keys($uploadedFiles)));
            
            if (empty($uploadedFiles['file'])) {
                error_log('TeamFileController::uploadFile - No file found in upload');
                return $this->responseService->error('Файл не найден', 400);
            }

            $file = $uploadedFiles['file'];
            error_log('TeamFileController::uploadFile - File error code: ' . $file->getError());
            error_log('TeamFileController::uploadFile - File name: ' . $file->getClientFilename());
            error_log('TeamFileController::uploadFile - File size: ' . $file->getSize());
            error_log('TeamFileController::uploadFile - File type: ' . $file->getClientMediaType());
            
            if ($file->getError() !== UPLOAD_ERR_OK) {
                error_log('TeamFileController::uploadFile - Upload error: ' . $file->getError());
                return $this->responseService->error('Ошибка загрузки файла', 400);
            }

            // Получаем дополнительные параметры
            $parsedBody = $request->getParsedBody();
            $taskId = $parsedBody['task_id'] ?? null;
            $projectId = $parsedBody['project_id'] ?? null;

            error_log('TeamFileController::uploadFile - Calling fileService->uploadFile');
            // Загружаем файл
            error_log('TeamFileController::uploadFile - About to call fileService->uploadFile');
            $fileData = $this->fileService->uploadFile($file, $teamId, $userId, $taskId, $projectId);

            if ($fileData) {
                error_log('TeamFileController::uploadFile - File uploaded successfully: ' . json_encode($fileData));
                return $this->responseService->success($fileData, 'Файл загружен успешно', 201);
            } else {
                error_log('TeamFileController::uploadFile - FileService returned null - likely validation failed');
                return $this->responseService->error('Ошибка загрузки файла. Проверьте тип и размер файла.', 400);
            }
        } catch (\Exception $e) {
            error_log('TeamFileController::uploadFile - Exception: ' . $e->getMessage());
            error_log('TeamFileController::uploadFile - Stack trace: ' . $e->getTraceAsString());
            return $this->responseService->error('Ошибка загрузки файла: ' . $e->getMessage(), 500);
        }
    }

    // Скачивание файла
    public function downloadFile($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }

            $teamId = $args['id'] ?? null;
            $fileId = $args['file_id'] ?? null;
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            // Получаем файл
            $fileData = $this->fileService->getFile($fileId, $teamId);
            if (!$fileData) {
                return $this->responseService->error('Файл не найден', 404);
            }

            // Возвращаем файл
            $response = $response->withHeader('Content-Type', $fileData['mime_type']);
            $response = $response->withHeader('Content-Disposition', 'attachment; filename="' . $fileData['original_filename'] . '"');
            $response->getBody()->write($fileData['file_data']);
            
            return $response;
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка скачивания файла: ' . $e->getMessage(), 500);
        }
    }

    // Удаление файла
    public function deleteFile($request, $response, $args)
    {
        try {
            $userId = $this->getCurrentUserId($request);
            if (!$userId) {
                return $this->responseService->error('Неавторизованный доступ', 401);
            }

            $teamId = $args['id'] ?? null;
            $fileId = $args['file_id'] ?? null;
            
            // Проверяем, является ли пользователь участником команды
            if (!$this->teamModel->isMember($teamId, $userId)) {
                return $this->responseService->error('Доступ запрещен', 403);
            }

            // Удаляем файл
            $result = $this->fileService->deleteFile($fileId, $teamId, $userId);
            
            if ($result) {
                return $this->responseService->success(null, 'Файл удален успешно');
            } else {
                return $this->responseService->error('Ошибка удаления файла', 500);
            }
        } catch (\Exception $e) {
            return $this->responseService->error('Ошибка удаления файла: ' . $e->getMessage(), 500);
        }
    }
}

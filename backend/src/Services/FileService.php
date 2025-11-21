<?php

namespace App\Services;

use App\Database\Database;

class FileService
{
    private $uploadPath;
    private $baseUrl;
    private $db;

    public function __construct()
    {
        $this->uploadPath = __DIR__ . '/../../public/uploads/';
        $this->baseUrl = 'http://localhost:8000/uploads/';
        $this->db = Database::getInstance()->getConnection();

        // Создаем директории, если они не существуют
        $this->ensureDirectoriesExist();
    }

    public function getUploadPath()
    {
        return $this->uploadPath;
    }

    /**
     * Загрузить изображение
     */
    public function uploadImage($file, $subfolder = '')
    {
        try {
            // Валидация файла
            if (!$this->isValidImage($file)) {
                return ['success' => false, 'error' => 'Недопустимый тип файла'];
            }

            // Генерируем уникальное имя файла
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $extension;
            
            // Путь для сохранения
            $targetDir = $this->uploadPath . $subfolder . '/';
            $targetPath = $targetDir . $filename;
            
            // Создаем подпапку, если нужно
            if ($subfolder && !is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            // Перемещаем файл
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $url = $this->baseUrl . $subfolder . '/' . $filename;
                return [
                    'success' => true,
                    'url' => $url,
                    'path' => $targetPath,
                    'filename' => $filename
                ];
            } else {
                return ['success' => false, 'error' => 'Ошибка загрузки файла'];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Удалить файл по пути
     */
    public function deleteFileByPath($filePath)
    {
        try {
            if (file_exists($filePath)) {
                return unlink($filePath);
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Удалить файл по URL
     */
    public function deleteFileByUrl($url)
    {
        try {
            $filePath = str_replace($this->baseUrl, $this->uploadPath, $url);
            return $this->deleteFileByPath($filePath);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Проверить, является ли файл изображением
     */
    private function isValidImage($file)
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if ($file['size'] > $maxSize) {
            return false;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        return in_array($mimeType, $allowedTypes);
    }

    /**
     * Создать необходимые директории
     */
    private function ensureDirectoriesExist()
    {
        $directories = [
            $this->uploadPath,
            $this->uploadPath . 'avatars/',
            $this->uploadPath . 'tasks/',
            $this->uploadPath . 'teams/',
        ];

        foreach ($directories as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    /**
     * Загрузить файл команды
     */
    public function uploadFile($uploadedFile, $teamId, $userId, $taskId = null, $projectId = null)
    {
        try {
            error_log('FileService::uploadFile - Starting upload');
            error_log('FileService::uploadFile - Team ID: ' . $teamId);
            error_log('FileService::uploadFile - User ID: ' . $userId);
            error_log('FileService::uploadFile - File name: ' . $uploadedFile->getClientFilename());
            error_log('FileService::uploadFile - File size: ' . $uploadedFile->getSize());
            error_log('FileService::uploadFile - File type: ' . $uploadedFile->getClientMediaType());
            
            // Валидация файла
            $validationResult = $this->isValidFile($uploadedFile);
            if (!$validationResult['valid']) {
                error_log('FileService::uploadFile - File validation failed: ' . $validationResult['error']);
                return null; // Возвращаем null для совместимости с существующим кодом
            }
            error_log('FileService::uploadFile - File validation passed');

            // Генерируем уникальное имя файла
            $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $extension;
            error_log('FileService::uploadFile - Generated filename: ' . $filename);
            
            // Путь для сохранения
            $targetDir = $this->uploadPath . 'teams/' . $teamId . '/';
            $targetPath = $targetDir . $filename;
            error_log('FileService::uploadFile - Target directory: ' . $targetDir);
            error_log('FileService::uploadFile - Target path: ' . $targetPath);
            
            // Создаем директорию команды, если нужно
            if (!is_dir($targetDir)) {
                error_log('FileService::uploadFile - Creating directory: ' . $targetDir);
                mkdir($targetDir, 0755, true);
            }

            // Перемещаем файл
            error_log('FileService::uploadFile - Moving file to: ' . $targetPath);
            $uploadedFile->moveTo($targetPath);

            // Сохраняем информацию о файле в базе данных
            $fileId = 'file_' . uniqid() . '_' . substr(bin2hex(random_bytes(4)), 0, 8);
            error_log('FileService::uploadFile - Generated file ID: ' . $fileId);
            
            $sql = "INSERT INTO team_files (id, team_id, user_id, task_id, project_id, original_filename, filename, file_path, mime_type, file_size, created_at) 
                    VALUES (:id, :team_id, :user_id, :task_id, :project_id, :original_filename, :filename, :file_path, :mime_type, :file_size, NOW())";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'id' => $fileId,
                'team_id' => $teamId,
                'user_id' => $userId,
                'task_id' => $taskId,
                'project_id' => $projectId,
                'original_filename' => $uploadedFile->getClientFilename(),
                'filename' => $filename,
                'file_path' => $targetPath,
                'mime_type' => $uploadedFile->getClientMediaType(),
                'file_size' => $uploadedFile->getSize()
            ]);

            if ($result) {
                error_log('FileService::uploadFile - Database insert successful');
                return $this->getFile($fileId, $teamId);
            } else {
                error_log('FileService::uploadFile - Database insert failed');
                return null;
            }
        } catch (\Exception $e) {
            error_log('FileService::uploadFile - Exception: ' . $e->getMessage());
            error_log('FileService::uploadFile - Stack trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Получить файлы команды
     */
    public function getTeamFiles($teamId)
    {
        try {
            $sql = "SELECT tf.*, u.name as user_name 
                    FROM team_files tf 
                    LEFT JOIN users u ON tf.user_id = u.id 
                    WHERE tf.team_id = :team_id 
                    ORDER BY tf.created_at DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['team_id' => $teamId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log('Ошибка получения файлов команды: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Получить файл по ID
     */
    public function getFile($fileId, $teamId)
    {
        try {
            $sql = "SELECT tf.*, u.name as user_name 
                    FROM team_files tf 
                    LEFT JOIN users u ON tf.user_id = u.id 
                    WHERE tf.id = :file_id AND tf.team_id = :team_id";

            $stmt = $this->db->prepare($sql);
            $stmt->execute(['file_id' => $fileId, 'team_id' => $teamId]);
            
            $file = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($file && file_exists($file['file_path'])) {
                $file['file_data'] = file_get_contents($file['file_path']);
                return $file;
            }

            return null;
        } catch (\Exception $e) {
            error_log('Ошибка получения файла: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Удалить файл команды
     */
    public function deleteFile($fileId, $teamId, $userId)
    {
        try {
            // Получаем информацию о файле
            $sql = "SELECT * FROM team_files WHERE id = :file_id AND team_id = :team_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['file_id' => $fileId, 'team_id' => $teamId]);
            $file = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$file) {
                return false;
            }

            // Проверяем права доступа (только владелец или админ команды может удалить)
            if ($file['user_id'] !== $userId) {
                // TODO: Проверить, является ли пользователь админом команды
                return false;
            }

            // Удаляем физический файл
            if (file_exists($file['file_path'])) {
                unlink($file['file_path']);
            }

            // Удаляем запись из базы данных
            $sql = "DELETE FROM team_files WHERE id = :file_id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute(['file_id' => $fileId]);
        } catch (\Exception $e) {
            error_log('Ошибка удаления файла: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Проверить валидность файла
     */
    private function isValidFile($uploadedFile)
    {
        $maxSize = 50 * 1024 * 1024; // 50MB
        $allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv', 'application/zip', 'application/x-rar-compressed'
        ];

        $fileSize = $uploadedFile->getSize();
        $fileType = $uploadedFile->getClientMediaType();

        error_log('FileService::isValidFile - File size: ' . $fileSize . ', type: ' . $fileType);

        if ($fileSize > $maxSize) {
            error_log('FileService::isValidFile - File too large: ' . $fileSize . ' > ' . $maxSize);
            return ['valid' => false, 'error' => 'Файл слишком большой. Максимальный размер: 50MB'];
        }

        $isValid = in_array($fileType, $allowedTypes);
        error_log('FileService::isValidFile - Type allowed: ' . ($isValid ? 'yes' : 'no'));

        if (!$isValid) {
            error_log('FileService::isValidFile - Invalid file type: ' . $fileType);
            return ['valid' => false, 'error' => 'Недопустимый тип файла: ' . $fileType . '. Разрешены: изображения, PDF, документы, архивы'];
        }

        return ['valid' => true];
    }
}

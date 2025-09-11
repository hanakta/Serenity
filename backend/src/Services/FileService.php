<?php

namespace App\Services;

class FileService
{
    private $uploadPath;
    private $baseUrl;

    public function __construct()
    {
        $this->uploadPath = __DIR__ . '/../../public/uploads/';
        $this->baseUrl = 'http://localhost:8000/uploads/';
        
        // Создаем директории, если они не существуют
        $this->ensureDirectoriesExist();
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
    public function deleteFile($filePath)
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
            return $this->deleteFile($filePath);
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
        ];

        foreach ($directories as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }
}

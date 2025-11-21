# Руководство по установке - Serenity Task Manager

## Системные требования

### Минимальные требования
- **Node.js**: 18.0.0 или выше
- **PHP**: 8.2 или выше
- **MySQL**: 8.0 или выше (или SQLite 3)
- **Composer**: 2.0 или выше
- **npm**: 8.0 или выше

### Рекомендуемые требования
- **Node.js**: 20.0.0 или выше
- **PHP**: 8.3 или выше
- **MySQL**: 8.0 или выше
- **RAM**: 4GB или больше
- **Дисковое пространство**: 2GB свободного места

## Установка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd to_do_project\ 3
```

### 2. Установка зависимостей

#### Backend (PHP)
```bash
cd backend
composer install
```

#### Frontend (Node.js)
```bash
cd frontend
npm install
```

#### Shared (TypeScript types)
```bash
cd shared
npm install
```

#### Root dependencies
```bash
npm install
```

### 3. Настройка базы данных

#### MySQL
1. Создайте базу данных:
```sql
CREATE DATABASE serenity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Импортируйте схему:
```bash
mysql -u root -p serenity < backend/database/schema_complete.sql
```

#### SQLite (альтернатива)
```bash
# SQLite файл уже создан в backend/database/serenity.db
# Дополнительная настройка не требуется
```

### 4. Настройка переменных окружения

#### Backend (.env)
Создайте файл `backend/.env`:
```env
# База данных
DB_HOST=localhost
DB_PORT=8889
DB_DATABASE=serenity
DB_USERNAME=root
DB_PASSWORD=root
DB_SOCKET=/Applications/MAMP/tmp/mysql/mysql.sock

# JWT настройки
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# CORS настройки
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Приложение
APP_URL=http://localhost:8000
APP_ENV=development
```

#### Frontend (.env.local)
Создайте файл `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Serenity
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 5. Запуск приложения

#### Development режим
```bash
# Запуск всех сервисов одновременно
npm run dev

# Или запуск по отдельности:

# Backend (PHP)
cd backend
php -S localhost:8000 -t public

# Frontend (Next.js)
cd frontend
npm run dev
```

#### Production режим
```bash
# Сборка frontend
npm run build

# Запуск production сервера
npm run start
```

## Настройка веб-сервера

### Apache
Создайте виртуальный хост:
```apache
<VirtualHost *:80>
    DocumentRoot /path/to/to_do_project\ 3/backend/public
    ServerName serenity.local
    
    <Directory /path/to/to_do_project\ 3/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx
```nginx
server {
    listen 80;
    server_name serenity.local;
    root /path/to/to_do_project\ 3/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Docker (опционально)

### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: serenity
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_DATABASE=serenity
      - DB_USERNAME=root
      - DB_PASSWORD=root

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Dockerfile (Backend)
```dockerfile
FROM php:8.2-fpm

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Установка PHP расширений
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Настройка для разработки

### 1. IDE настройки

#### VS Code
Установите расширения:
- PHP Intelephense
- TypeScript Importer
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

#### PhpStorm
Настройте:
- PHP интерпретатор
- Composer autoload
- Database connection
- Node.js interpreter

### 2. Git hooks
```bash
# Pre-commit hook для проверки кода
#!/bin/sh
npm run lint
composer run analyze
```

### 3. Debugging

#### Xdebug (PHP)
```ini
[xdebug]
zend_extension=xdebug.so
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_host=host.docker.internal
xdebug.client_port=9003
```

#### Chrome DevTools
- React Developer Tools
- Redux DevTools
- Network tab для API debugging

## Мониторинг и логирование

### 1. Логи приложения
```bash
# Backend логи
tail -f backend/storage/logs/app.log

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. Мониторинг производительности
```bash
# PHP-FPM статус
curl http://localhost/status

# MySQL статус
mysqladmin -u root -p status
```

### 3. Health checks
```bash
# API health check
curl http://localhost:8000/api/health

# Frontend health check
curl http://localhost:3000/api/health
```

## Troubleshooting

### Частые проблемы

#### 1. Ошибка подключения к базе данных
```bash
# Проверьте настройки в .env
# Убедитесь, что MySQL запущен
# Проверьте права доступа пользователя
```

#### 2. CORS ошибки
```bash
# Добавьте домен в CORS_ORIGINS
# Проверьте настройки веб-сервера
```

#### 3. JWT токены не работают
```bash
# Проверьте JWT_SECRET в .env
# Убедитесь, что токен передается в заголовке Authorization
```

#### 4. Frontend не подключается к API
```bash
# Проверьте NEXT_PUBLIC_API_URL
# Убедитесь, что backend запущен на правильном порту
```

### Логи для диагностики
```bash
# PHP ошибки
tail -f /var/log/php_errors.log

# Nginx ошибки
tail -f /var/log/nginx/error.log

# MySQL ошибки
tail -f /var/log/mysql/error.log
```

## Безопасность

### 1. Production настройки
```env
# Измените все пароли по умолчанию
# Используйте сильные JWT секреты
# Настройте HTTPS
# Ограничьте CORS origins
```

### 2. Файловые права
```bash
# Установите правильные права на файлы
chmod 755 backend/public
chmod 644 backend/.env
```

### 3. Firewall
```bash
# Ограничьте доступ к портам
# Используйте только необходимые порты
# Настройте fail2ban для защиты от брутфорса
```

## Резервное копирование

### 1. База данных
```bash
# MySQL dump
mysqldump -u root -p serenity > backup_$(date +%Y%m%d).sql

# SQLite backup
cp backend/database/serenity.db backup_$(date +%Y%m%d).db
```

### 2. Файлы приложения
```bash
# Создание архива
tar -czf serenity_backup_$(date +%Y%m%d).tar.gz /path/to/project
```

## Обновление

### 1. Обновление зависимостей
```bash
# Backend
cd backend
composer update

# Frontend
cd frontend
npm update

# Shared
cd shared
npm update
```

### 2. Миграции базы данных
```bash
# Применение миграций
php backend/database/migrate.php
```

### 3. Очистка кэша
```bash
# Очистка Composer кэша
composer clear-cache

# Очистка npm кэша
npm cache clean --force
```

## Производительность

### 1. Оптимизация PHP
```ini
# php.ini настройки
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
```

### 2. Оптимизация MySQL
```sql
-- Создание индексов
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 3. Оптимизация Frontend
```bash
# Сжатие статических файлов
npm run build:optimize

# CDN для статических ресурсов
# Настройка кэширования
```

Это руководство поможет вам успешно установить и настроить Serenity Task Manager в любой среде разработки или production.


# Serenity - Task Management System

A modern task management application with team collaboration features, built with Next.js frontend and PHP backend.

## Features

- 🔐 User authentication and authorization
- 📝 Task management with priorities and due dates
- 👥 Team collaboration and chat
- 📊 Task statistics and analytics
- 🎨 Modern, responsive UI
- 🔄 Real-time updates

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- React Hooks

### Backend
- PHP 8+
- Slim Framework 4
- MySQL
- JWT Authentication

## Installation

### Prerequisites
- Node.js 18+
- PHP 8+
- MySQL
- Composer

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Create `.env` file:
```bash
cp env.example .env
```

4. Configure database settings in `.env`:
```
DB_HOST=localhost
DB_PORT=8889
DB_DATABASE=serenity
DB_USERNAME=root
DB_PASSWORD=root
DB_SOCKET=/Applications/MAMP/tmp/mysql/mysql.sock
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
APP_URL=http://localhost:8000
```

5. Start PHP server:
```bash
php -S localhost:8000 -t public
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

## Database Setup

1. Create MySQL database named `serenity`
2. Import the schema from `backend/database/schema.sql`
3. Run any necessary migrations from `backend/database/` directory

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Register a new account or login
4. Start managing your tasks and teams!

## Project Structure

```
├── backend/           # PHP backend
│   ├── config/        # Configuration files
│   ├── database/      # Database schemas and migrations
│   ├── public/        # Public web files
│   ├── src/           # Source code
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Middleware/
│   └── vendor/        # Composer dependencies
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/       # Next.js app directory
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── public/
└── shared/            # Shared TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
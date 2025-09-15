-- Создание таблицы для отслеживания онлайн статуса пользователей
CREATE TABLE IF NOT EXISTS user_online_status (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_team (user_id, team_id)
);

-- Создание индексов для оптимизации
CREATE INDEX idx_user_online_status_user_id ON user_online_status(user_id);
CREATE INDEX idx_user_online_status_team_id ON user_online_status(team_id);
CREATE INDEX idx_user_online_status_is_online ON user_online_status(is_online);
CREATE INDEX idx_user_online_status_last_seen ON user_online_status(last_seen);

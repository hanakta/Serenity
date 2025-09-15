-- Создание таблицы для отслеживания статуса прочтения сообщений чата
CREATE TABLE IF NOT EXISTS team_chat_read_status (
    id VARCHAR(255) PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user (message_id, user_id)
);

-- Создание индексов для оптимизации
CREATE INDEX idx_team_chat_read_status_message_id ON team_chat_read_status(message_id);
CREATE INDEX idx_team_chat_read_status_user_id ON team_chat_read_status(user_id);
CREATE INDEX idx_team_chat_read_status_read_at ON team_chat_read_status(read_at);

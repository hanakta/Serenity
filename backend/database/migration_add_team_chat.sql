-- 🐱 Миграция для добавления чата команд

-- Таблица сообщений чата команды
CREATE TABLE IF NOT EXISTS team_chat_messages (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    reply_to_id TEXT NULL, -- ID сообщения, на которое отвечают
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES team_chat_messages(id) ON DELETE SET NULL
);

-- Индексы для team_chat_messages
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_team_id ON team_chat_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_user_id ON team_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_created_at ON team_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_reply_to_id ON team_chat_messages(reply_to_id);

-- Таблица статусов прочтения сообщений
CREATE TABLE IF NOT EXISTS team_chat_read_status (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES team_chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id)
);

-- Индексы для team_chat_read_status
CREATE INDEX IF NOT EXISTS idx_team_chat_read_status_message_id ON team_chat_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_read_status_user_id ON team_chat_read_status(user_id);


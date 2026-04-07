CREATE TABLE IF NOT EXISTS "t_p18178531_vk_subscriber_boost_".users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE,
  avatar_color VARCHAR(50) DEFAULT 'from-purple-500 to-cyan-500',
  avatar_initials VARCHAR(4),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "t_p18178531_vk_subscriber_boost_".chats (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) DEFAULT 'direct',
  name VARCHAR(100),
  avatar_color VARCHAR(50),
  avatar_initials VARCHAR(4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "t_p18178531_vk_subscriber_boost_".chat_members (
  chat_id BIGINT REFERENCES "t_p18178531_vk_subscriber_boost_".chats(id),
  user_id BIGINT REFERENCES "t_p18178531_vk_subscriber_boost_".users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS "t_p18178531_vk_subscriber_boost_".messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT REFERENCES "t_p18178531_vk_subscriber_boost_".chats(id),
  sender_id BIGINT REFERENCES "t_p18178531_vk_subscriber_boost_".users(id),
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON "t_p18178531_vk_subscriber_boost_".messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON "t_p18178531_vk_subscriber_boost_".chat_members(user_id);

-- speek 数据库表结构（MySQL 8.0）
-- 执行：mysql -u root -p speek < create_tables.sql
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(32),
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(512),
  created_at BIGINT NOT NULL,
  UNIQUE KEY uk_username (username),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(64) NOT NULL,
  type VARCHAR(32),
  title VARCHAR(255),
  body MEDIUMTEXT,
  ts BIGINT,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS character_profile (
  id INT NOT NULL DEFAULT 1 PRIMARY KEY,
  name VARCHAR(64),
  base_setting MEDIUMTEXT,
  learned MEDIUMTEXT,
  learned_turns INT DEFAULT 0,
  updated_at BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_profile (
  user_id INT NOT NULL,
  name VARCHAR(64),
  base_setting MEDIUMTEXT,
  learned MEDIUMTEXT,
  learned_turns INT DEFAULT 0,
  persona_key VARCHAR(64),
  persona_title VARCHAR(128),
  bot_avatar VARCHAR(512),
  updated_at BIGINT,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(64) NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255),
  title_lock TINYINT(1) DEFAULT 0,
  pinned TINYINT(1) DEFAULT 0,
  created_at BIGINT,
  updated_at BIGINT,
  p_name VARCHAR(64),
  p_base_setting MEDIUMTEXT,
  p_learned MEDIUMTEXT,
  p_learned_turns INT DEFAULT 0,
  p_bot_avatar VARCHAR(512),
  p_persona_key VARCHAR(64),
  p_persona_title VARCHAR(128),
  p_updated_at BIGINT,
  PRIMARY KEY (id),
  KEY idx_conv_user (user_id),
  CONSTRAINT fk_conv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id VARCHAR(64) NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(16) NOT NULL,
  content MEDIUMTEXT,
  attachments JSON,
  files JSON,
  seq INT NOT NULL,
  created_at BIGINT,
  KEY idx_msg_conv (conversation_id),
  KEY idx_msg_user (user_id),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

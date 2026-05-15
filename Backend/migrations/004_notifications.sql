-- Migration 004: notifications table
-- Stores in-app notifications per user. Fired on ticket status changes
-- and asset assignments. is_read flag drives the notification center badge.

CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT         NOT NULL,
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT,
  entity_type VARCHAR(50),
  entity_id   INT,
  is_read     TINYINT(1)  DEFAULT 0,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_unread (user_id, is_read)
);

-- Migration 002: audit_logs table
-- Records every create/update/delete event with actor, timestamp,
-- entity type/id, and a JSON diff (before/after snapshot).

CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT,
  actor_name  VARCHAR(100),
  actor_role  VARCHAR(50),
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   INT          NOT NULL,
  action      ENUM('create','update','delete') NOT NULL,
  before_data JSON,
  after_data  JSON,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_entity  (entity_type, entity_id),
  INDEX idx_al_actor   (actor_id),
  INDEX idx_al_created (created_at)
);

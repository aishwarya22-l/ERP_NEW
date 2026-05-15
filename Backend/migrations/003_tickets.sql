-- Migration 003: tickets table
-- Supports SLA tracking, priority levels, escalation flag,
-- and resolution timeline per spec item 7.

CREATE TABLE IF NOT EXISTS tickets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  reporter_id   INT,
  assignee_id   INT,
  department_id INT,
  category      VARCHAR(100),
  priority      ENUM('low','medium','high','urgent') DEFAULT 'medium',
  status        ENUM('open','in_progress','resolved','closed','escalated') DEFAULT 'open',
  sla_hours     INT          DEFAULT 24,
  sla_due_at    TIMESTAMP    NULL,
  escalated     TINYINT(1)   DEFAULT 0,
  escalated_at  TIMESTAMP    NULL,
  resolved_at   TIMESTAMP    NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id)   REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (assignee_id)   REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_tickets_status    (status),
  INDEX idx_tickets_priority  (priority),
  INDEX idx_tickets_assignee  (assignee_id),
  INDEX idx_tickets_reporter  (reporter_id),
  INDEX idx_tickets_sla       (sla_due_at),
  INDEX idx_tickets_escalated (escalated)
);

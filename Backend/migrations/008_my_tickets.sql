-- Migration 008: My Tickets feature
-- Adds reporter tracking and closed status to maintenance_logs

ALTER TABLE maintenance_logs
ADD COLUMN raised_by INT NULL AFTER asset_id,
ADD FOREIGN KEY (raised_by) REFERENCES employees(id) ON DELETE SET NULL,
MODIFY COLUMN status ENUM('open','in_progress','resolved','closed') DEFAULT 'open';

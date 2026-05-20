-- Migration 006: link tickets to assets
ALTER TABLE tickets ADD COLUMN asset_id INT NULL AFTER department_id;
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD INDEX idx_tickets_asset (asset_id);

-- Migration 001: Indexes on existing tables
-- Adds UNIQUE constraint on employees.email and performance indexes
-- on all foreign-key and frequently-filtered columns.

-- employees
ALTER TABLE employees ADD UNIQUE INDEX IF NOT EXISTS uq_employees_email (email);
ALTER TABLE employees ADD INDEX IF NOT EXISTS idx_employees_department (department);

-- assets
ALTER TABLE assets ADD INDEX IF NOT EXISTS idx_assets_status (status);
ALTER TABLE assets ADD INDEX IF NOT EXISTS idx_assets_category_id (category_id);

-- asset_assignments
ALTER TABLE asset_assignments ADD INDEX IF NOT EXISTS idx_aa_asset_id (asset_id);
ALTER TABLE asset_assignments ADD INDEX IF NOT EXISTS idx_aa_user_id (user_id);
ALTER TABLE asset_assignments ADD INDEX IF NOT EXISTS idx_aa_status (status);

-- maintenance_logs
ALTER TABLE maintenance_logs ADD INDEX IF NOT EXISTS idx_ml_asset_id (asset_id);
ALTER TABLE maintenance_logs ADD INDEX IF NOT EXISTS idx_ml_status (status);
ALTER TABLE maintenance_logs ADD INDEX IF NOT EXISTS idx_ml_priority (priority);

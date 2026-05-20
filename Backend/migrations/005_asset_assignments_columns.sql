ALTER TABLE asset_assignments ADD COLUMN notes TEXT AFTER status;
ALTER TABLE asset_assignments ADD COLUMN returned_at TIMESTAMP NULL AFTER notes;
ALTER TABLE asset_assignments ADD COLUMN returned_by INT NULL AFTER returned_at;
ALTER TABLE asset_assignments ADD CONSTRAINT fk_aa_returned_by FOREIGN KEY (returned_by) REFERENCES employees(id) ON DELETE SET NULL;

-- Migration 007: add maintenance_type column to maintenance_logs
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(100);
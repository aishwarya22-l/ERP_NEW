import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const initDatabase = async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
  });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS erp`);
    console.log("DB created");

    await conn.query(`USE erp`);
    console.log("Using DB");

    // USERS
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          email VARCHAR(100) UNIQUE,
          password VARCHAR(255),
          role ENUM('admin','manager','employee') DEFAULT 'employee',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Users table ✅");
    } catch (err) {
      console.error("Users error ❌", err);
    }

    // TASKS (FIXED FK)
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100),
          assigned_to INT NULL,
          status VARCHAR(50),
          FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log("Tasks table ✅");
    } catch (err) {
      console.error("Tasks error ❌", err);
    }

    // EMPLOYEES (SEPARATE BLOCK)
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS employees (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(100),
          email VARCHAR(100),
          password VARCHAR(255),
          role VARCHAR(50),
          department VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        )
      `);
      console.log("Employees table ✅");
    } catch (err) {
      console.error("Employees error ❌", err);
    }

    // ROLES
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description VARCHAR(255),
          permissions JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Roles table ✅");
    } catch (err) {
      console.error("Roles error ❌", err);
    }

    // DEPARTMENTS
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS departments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description VARCHAR(255),
          location VARCHAR(100),
          manager_id INT,
          status ENUM('active','inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
        )
      `);
      console.log("Departments table ✅");
    } catch (err) {
      console.error("Departments error ❌", err);
    }

    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          color VARCHAR(7),
          status ENUM('active','inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Categories table ✅");
    } catch (err) {
      console.error("Categories error ❌", err);
    }

    // ================= ASSETS =================
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS assets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          asset_tag VARCHAR(100) UNIQUE NOT NULL,
          category_id INT,
          brand VARCHAR(100),
          model VARCHAR(100),
          purchase_date DATE,
          warranty_expiry DATE,
          status ENUM('available','assigned','maintenance','retired') DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);
      console.log("Assets table ✅");
    } catch (err) {
      console.error("Assets error ❌", err);
    }

    // ================= ASSET ASSIGNMENTS =================
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS asset_assignments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          asset_id INT,
          department VARCHAR(100),
          user VARCHAR(100),
          user_id INT,
          assigned_date DATE,
          return_date DATE,
          status ENUM('assigned','returned') DEFAULT 'assigned',
          FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      console.log("Asset Assignments table ✅");
    } catch (err) {
      console.error("Asset Assignments error ❌", err);
    }

    // ================= MAINTENANCE =================
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS maintenance_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          asset_id INT,
          raised_by INT,
          issue TEXT,
          priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
          status ENUM('open','in_progress','resolved','closed','reopened') DEFAULT 'open',
          maintenance_type VARCHAR(100),
          technician VARCHAR(100),
          maintenance_date DATE,
          completion_date DATE,
          cost DECIMAL(10,2),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
          FOREIGN KEY (raised_by) REFERENCES employees(id) ON DELETE SET NULL
        )
      `);
      console.log("Maintenance table ✅");
    } catch (err) {
      console.error("Maintenance error ❌", err);
    }

    // Add raised_by to existing maintenance_logs (safe to re-run — errors 1060/1061/1826 are ignored)
    try {
      await conn.query(`ALTER TABLE maintenance_logs ADD COLUMN raised_by INT DEFAULT NULL`);
      console.log("Maintenance raised_by column ✅");
    } catch (err) {
      if (![1060, 1061, 1826].includes(err.errno)) console.warn("raised_by ALTER warn:", err.message);
    }
    try {
      await conn.query(`ALTER TABLE maintenance_logs ADD CONSTRAINT fk_ml_raised_by FOREIGN KEY (raised_by) REFERENCES employees(id) ON DELETE SET NULL`);
    } catch (err) {
      if (![1060, 1061, 1826].includes(err.errno)) console.warn("raised_by FK warn:", err.message);
    }
    // Extend status ENUM to include closed and reopened
    try {
      await conn.query(`ALTER TABLE maintenance_logs MODIFY COLUMN status ENUM('open','in_progress','resolved','closed','reopened') DEFAULT 'open'`);
      console.log("Maintenance status ENUM extended ✅");
    } catch (err) {
      console.warn("status ENUM alter warn:", err.message);
    }

    // ================= TICKETS =================
    try {
      await conn.query(`
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
          INDEX idx_tickets_reporter  (reporter_id)
        )
      `);
      console.log("Tickets table ✅");
    } catch (err) {
      console.error("Tickets error ❌", err);
    }

    // ================= RUN MIGRATIONS =================
    await runMigrations(conn);

  } catch (err) {
    console.error("DB INIT ERROR ❌", err);
  }

  await conn.end();
};

async function runMigrations(conn) {
  // Track which migrations have been applied
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const filename of files) {
    const [[existing]] = await conn.query(
      `SELECT id FROM schema_migrations WHERE filename = ?`,
      [filename]
    );
    if (existing) continue;

    console.log(`Running migration: ${filename}`);
    const sql = fs.readFileSync(path.join(migrationsDir, filename), "utf8");

    // Strip -- comments first, then split on semicolons and skip blanks
    const statements = sql
      .replace(/--[^\n]*/g, "")
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let ok = true;
    for (const stmt of statements) {
      try {
        await conn.query(stmt);
      } catch (err) {
        // 1060 = duplicate column, 1061 = duplicate key name, 1826 = duplicate FK — already applied
        if ([1060, 1061, 1826].includes(err.errno)) {
          console.warn(`  ↳ skipped (already exists): ${err.sqlMessage}`);
        } else {
          console.error(`  ↳ FAILED: ${err.sqlMessage}`);
          ok = false;
        }
      }
    }

    if (ok) {
      await conn.query(
        `INSERT INTO schema_migrations (filename) VALUES (?)`,
        [filename]
      );
      console.log(`  ✅ ${filename} applied`);
    }
  }
}

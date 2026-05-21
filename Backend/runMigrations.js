import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigrationsManually = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT || 3306)
  });

  try {
    await conn.query(`USE \`${process.env.DB_NAME || "erp"}\``);

    // Track which migrations have been applied
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.log("Migrations directory doesn't exist");
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} migration files:`, files);

    for (const filename of files) {
      const [[existing]] = await conn.query(
        `SELECT id FROM schema_migrations WHERE filename = ?`,
        [filename]
      );
      if (existing) {
        console.log(`Migration ${filename} already applied`);
        continue;
      }

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
          console.log(`Executing: ${stmt.substring(0, 50)}...`);
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

    console.log("Migrations completed!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await conn.end();
  }
};

runMigrationsManually();

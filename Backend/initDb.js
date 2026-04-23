import mysql from "mysql2/promise";

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

    // ================= ASSETS =================
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

    // ================= ASSET ASSIGNMENTS =================
    await conn.query(`
      CREATE TABLE IF NOT EXISTS asset_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_id INT,
        user_id INT,
        assigned_date DATE,
        return_date DATE,
        status ENUM('assigned','returned') DEFAULT 'assigned',
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log("Asset Assignments table ✅");

    // ================= MAINTENANCE =================
    await conn.query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_id INT,
        issue TEXT,
        status ENUM('open','in_progress','resolved') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      )
    `);
    console.log("Maintenance table ✅");

  } catch (err) {
    console.error("DB INIT ERROR ❌", err);
  }

  await conn.end();
};
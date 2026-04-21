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
          role VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        )
      `);
      console.log("Employees table ✅");
    } catch (err) {
      console.error("Employees error ❌", err);
    }

  } catch (err) {
    console.error("DB INIT ERROR ❌", err);
  }

  await conn.end();
};
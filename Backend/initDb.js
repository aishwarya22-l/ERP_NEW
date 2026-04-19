import mysql from "mysql2/promise";

export const initDatabase = async () => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS erp`);
  await conn.query(`USE erp`);

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

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100),
      assigned_to INT,
      status VARCHAR(50),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  conn.end();
};
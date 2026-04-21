import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "erp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3306
});

export default db;
import express from "express";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const router = express.Router();

const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "erp"
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, hash]
  );

  res.json({ message: "Registered" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    "SELECT id, name, email, password, role FROM users WHERE email=?",
    [email]
  );

  if (!rows.length) {
    return res.status(400).json({ message: "User not found" });
  }

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Wrong password" });
  }

  // ✅ ROLE COMES FROM DB (NOT FRONTEND)
  req.session.user = {
    id: user.id,
    name: user.name,
    role: user.role
  };

  res.json({ user: req.session.user });
});

router.get("/me", (req, res) => {
  res.json(req.session.user || null);
});

export default router;
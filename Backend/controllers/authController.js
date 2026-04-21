import bcrypt from "bcryptjs";
import db from "../config/db.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hash]
    );

    res.json({ message: "Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
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

    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role
    };

    res.json({ user: req.session.user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CURRENT USER
export const getCurrentUser = (req, res) => {
  res.json(req.session.user || null);
};
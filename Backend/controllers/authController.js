import bcrypt from "bcryptjs";
import db from "../config/db.js";

// REGISTER - For external users (not employees)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hash]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN - Check both users and employees tables
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();
    let user = null;
    let userSource = "users";

    // Check users table
    const [userRows] = await db.query(
      "SELECT id, name, email, password, role FROM users WHERE email=?",
      [normalizedEmail]
    );

    if (userRows.length > 0) {
      user = userRows[0];
    } else {
      // Check employees table
      const [empRows] = await db.query(
        "SELECT id, name, email, password, role FROM employees WHERE email=?",
        [normalizedEmail]
      );

      if (empRows.length > 0) {
        user = empRows[0];
        userSource = "employees";
      }
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const normalizedRole = (user.role || "")
      .toString()
      .trim()
      .toLowerCase() || "employee";

    // ✅ Only store role (no userType)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
    };

    res.json({
      message: "Login successful",
      user: req.session.user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// CURRENT USER
export const getCurrentUser = (req, res) => {
  res.json(req.session.user || null);
};

// LOGOUT
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
};
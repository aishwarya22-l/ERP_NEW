import express from "express";
import cors from "cors";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import { initDatabase } from "./initDb.js";

const app = express();

// Initialize database on startup
initDatabase().catch(err => console.error("Failed to initialize database:", err));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false
}));

// ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/roles", rolesRoutes);
app.listen(5000, () => console.log("Server running on port 5000"));
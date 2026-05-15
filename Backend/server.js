import express from "express";
import cors from "cors";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sseRoutes from "./routes/sseRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { initDatabase } from "./initDb.js";

const app = express();

// Initialize database on startup
initDatabase().then(() => {
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  }));

  app.use(express.json());

  if (!process.env.SESSION_SECRET) {
    console.warn("⚠️  SESSION_SECRET not set — using insecure default. Set it in .env for production.");
  }
  app.use(session({
    secret: process.env.SESSION_SECRET || "erp-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" }
  }));

  // ROUTES
  app.use("/api/auth", authRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/roles", rolesRoutes);
  app.use("/api/departments", departmentRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/maintenance", maintenanceRoutes);
  app.use("/api/tickets",       ticketRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/sse",           sseRoutes);
  app.use("/api/audit-logs",   auditRoutes);
  app.use("/api/analytics",    analyticsRoutes);
  app.use("/api/search",       searchRoutes);

  app.listen(5000, () => console.log("Server running on port 5000"));
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
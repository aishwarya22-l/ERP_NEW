import express from "express";
import cors from "cors";
import session from "express-session";
import { initDatabase } from "./initDb.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(session({
  secret: "erp_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 86400000
  }
}));

app.use("/api/auth", authRoutes);

app.listen(5000, async () => {
  console.log("Backend running");
  await initDatabase(); // ✅ AUTO DB
});
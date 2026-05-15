import express from "express";
import { isAuth } from "../middleware/auth.js";
import { addClient, removeClient } from "../sse.js";

const router = express.Router();

router.get("/", isAuth, (req, res) => {
  const userId = req.session.user.id;

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  addClient(userId, res);

  // Send a heartbeat every 25s to keep the connection alive through proxies
  const heartbeat = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});

export default router;

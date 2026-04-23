import express from "express";
import { getMaintenanceLogs, createMaintenanceLog } from "../controllers/maintenanceController.js";

const router = express.Router();

router.get("/", getMaintenanceLogs);
router.post("/", createMaintenanceLog);

export default router;

import express from "express";
import {
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  getMaintenanceLogsByStatus,
  getMaintenanceLogsByAsset
} from "../controllers/maintenanceController.js";

const router = express.Router();

/**
 * Main maintenance routes
 */

// GET all maintenance logs
router.get("/", getMaintenanceLogs);

// POST new maintenance log
router.post("/", createMaintenanceLog);

// GET maintenance log by ID
router.get("/:id", getMaintenanceLogById);

// PUT update maintenance log
router.put("/:id", updateMaintenanceLog);

// DELETE maintenance log
router.delete("/:id", deleteMaintenanceLog);

/**
 * Filter routes - More specific routes should be defined before parameterized ones
 */

// GET maintenance logs by status
router.get("/status/:status", getMaintenanceLogsByStatus);

// GET maintenance logs for a specific asset
router.get("/asset/:assetId", getMaintenanceLogsByAsset);

export default router;

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
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Specific filter routes must come before /:id to avoid being shadowed
router.get("/status/:status", isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogsByStatus);
router.get("/asset/:assetId", isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogsByAsset);

router.get("/",       isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogs);
router.post("/",      isAuth, allowRoles("admin", "manager", "assets"),             createMaintenanceLog);
router.get("/:id",    isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogById);
router.put("/:id",    isAuth, allowRoles("admin", "manager", "assets"),             updateMaintenanceLog);
router.delete("/:id", isAuth, allowRoles("admin", "manager", "assets"),             deleteMaintenanceLog);

export default router;

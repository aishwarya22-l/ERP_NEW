import express from "express";
import {
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  getMaintenanceLogsByStatus,
  getMaintenanceLogsByAsset,
  getMyTickets,
  reopenTicket
} from "../controllers/maintenanceController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Specific named routes must come before /:id to avoid shadowing
router.get("/my-tickets",        isAuth, allowRoles("employee", "admin", "manager", "assets"), getMyTickets);
router.get("/status/:status",    isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogsByStatus);
router.get("/asset/:assetId",    isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogsByAsset);

router.get("/",       isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogs);
router.post("/",      isAuth, allowRoles("admin", "manager", "assets", "employee"), createMaintenanceLog);
router.get("/:id",    isAuth, allowRoles("admin", "manager", "employee", "assets"), getMaintenanceLogById);
router.put("/:id",    isAuth, allowRoles("admin", "manager", "assets"),             updateMaintenanceLog);
router.delete("/:id", isAuth, allowRoles("admin", "manager", "assets"),             deleteMaintenanceLog);
router.patch("/:id/reopen", isAuth, allowRoles("employee", "admin", "manager", "assets"), reopenTicket);

export default router;

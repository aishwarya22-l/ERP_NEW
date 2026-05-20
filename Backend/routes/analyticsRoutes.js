import express from "express";
import { isAuth, allowRoles } from "../middleware/auth.js";
import {
  getDashboardStats,
  getAssetStatusDistribution,
  getTicketMetrics,
  getEmployeesByDepartment,
  getDepartmentPerformance,
  getCustodyIntelligence,
} from "../controllers/analyticsController.js";

const router = express.Router();
const guard = [isAuth, allowRoles("admin", "manager", "employee", "assets")];

router.get("/dashboard",             ...guard, getDashboardStats);
router.get("/asset-status",          ...guard, getAssetStatusDistribution);
router.get("/ticket-metrics",        ...guard, getTicketMetrics);
router.get("/employees-by-dept",     ...guard, getEmployeesByDepartment);
router.get("/department-performance",...guard, getDepartmentPerformance);
router.get("/custody-intelligence",  ...guard, getCustodyIntelligence);

export default router;

import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/",      isAuth, allowRoles("admin", "manager", "employee"), getEmployees);
router.post("/",     isAuth, allowRoles("admin"),                        createEmployee);
router.put("/:id",   isAuth, allowRoles("admin"),                        updateEmployee);
router.delete("/:id",isAuth, allowRoles("admin"),                        deleteEmployee);

export default router;

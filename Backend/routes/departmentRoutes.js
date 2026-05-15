import express from "express";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/",      isAuth, allowRoles("admin", "manager", "employee"), getDepartments);
router.get("/:id",   isAuth, allowRoles("admin", "manager", "employee"), getDepartmentById);
router.post("/",     isAuth, allowRoles("admin"),                        createDepartment);
router.put("/:id",   isAuth, allowRoles("admin"),                        updateDepartment);
router.delete("/:id",isAuth, allowRoles("admin"),                        deleteDepartment);

export default router;

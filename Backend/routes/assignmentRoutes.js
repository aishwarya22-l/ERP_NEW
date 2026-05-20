import express from "express";
import {
  getAssignments,
  getUsersByDepartment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  returnAssignment
} from "../controllers/assignmentController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Specific paths before parameterized ones
router.get("/users/:department", isAuth, allowRoles("admin", "manager"), getUsersByDepartment);

router.get("/",            isAuth, allowRoles("admin", "manager", "employee", "assets"), getAssignments);
router.post("/",           isAuth, allowRoles("admin", "manager"),             createAssignment);
router.put("/:id/return",  isAuth, allowRoles("admin", "manager"),             returnAssignment);
router.put("/:id",         isAuth, allowRoles("admin", "manager"),             updateAssignment);
router.delete("/:id",      isAuth, allowRoles("admin", "manager"),             deleteAssignment);

export default router;

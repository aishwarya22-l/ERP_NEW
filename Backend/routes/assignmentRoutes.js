import express from "express";
import { 
  getAssignments, 
  getUsersByDepartment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from "../controllers/assignmentController.js";

const router = express.Router();

router.get("/", getAssignments);
router.get("/users/:department", getUsersByDepartment);
router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;

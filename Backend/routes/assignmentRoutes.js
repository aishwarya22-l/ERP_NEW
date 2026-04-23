import express from "express";
import { getAssignments, createAssignment } from "../controllers/assignmentController.js";

const router = express.Router();

router.get("/", getAssignments);
router.post("/", createAssignment);

export default router;

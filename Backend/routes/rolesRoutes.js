import express from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/rolesController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/",      isAuth, allowRoles("admin"), getRoles);
router.get("/:id",   isAuth, allowRoles("admin"), getRoleById);
router.post("/",     isAuth, allowRoles("admin"), createRole);
router.put("/:id",   isAuth, allowRoles("admin"), updateRole);
router.delete("/:id",isAuth, allowRoles("admin"), deleteRole);

export default router;

import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/",      isAuth, allowRoles("admin", "manager", "employee", "assets"), getCategories);
router.post("/",     isAuth, allowRoles("admin", "manager", "assets"),             createCategory);
router.put("/:id",   isAuth, allowRoles("admin", "manager", "assets"),             updateCategory);
router.delete("/:id",isAuth, allowRoles("admin", "manager"),             deleteCategory);

export default router;

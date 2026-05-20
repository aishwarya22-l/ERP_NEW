import express from "express";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAvailableAssets,
  getAssignedAssets,
  getAssetHistory
} from "../controllers/assetController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Specific paths before /:id
router.get("/available",    isAuth, allowRoles("admin", "manager", "employee", "assets"), getAvailableAssets);
router.get("/assigned",     isAuth, allowRoles("admin", "manager", "employee", "assets"), getAssignedAssets);

router.get("/",             isAuth, allowRoles("admin", "manager", "employee", "assets"), getAssets);
router.post("/",            isAuth, allowRoles("admin", "manager", "assets"),             createAsset);

router.get("/:id/history",  isAuth, allowRoles("admin", "manager", "employee", "assets"), getAssetHistory);
router.get("/:id",          isAuth, allowRoles("admin", "manager", "employee", "assets"), getAssetById);
router.put("/:id",          isAuth, allowRoles("admin", "manager"),             updateAsset);
router.delete("/:id",       isAuth, allowRoles("admin", "manager"),             deleteAsset);

export default router;

import express from "express";
import {
  getAssets,
  createAsset,
  getAvailableAssets,
  getAssignedAssets
} from "../controllers/assetController.js";

const router = express.Router();

router.get("/", getAssets);
router.post("/", createAsset);
router.get("/available", getAvailableAssets);
router.get("/assigned", getAssignedAssets);

export default router;

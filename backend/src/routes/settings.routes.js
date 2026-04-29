import { Router } from "express";
import { getSettings, saveSettings } from "../controllers/settings.controller.js";
import { requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", requireStaff, getSettings);
router.put("/", requireStaff, saveSettings);

export default router;

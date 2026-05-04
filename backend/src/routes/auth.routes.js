import { Router } from "express";
import { loginStaff, loginClient, getMe, impersonate } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login/staff", loginStaff);
router.post("/login/client", loginClient);
router.get("/me", requireAuth, getMe);
router.post("/impersonate/:tenantId", requireAuth, impersonate);

export default router;

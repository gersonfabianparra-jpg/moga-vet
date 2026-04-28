import { Router } from "express";
import { getAll, create } from "../controllers/vaccines.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getAll);
router.post("/", requireStaff, create);

export default router;

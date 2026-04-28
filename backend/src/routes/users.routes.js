import { Router } from "express";
import { getAll, create } from "../controllers/users.controller.js";
import { requireStaff, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireStaff, getAll);
router.post("/", requireAdmin, create);

export default router;

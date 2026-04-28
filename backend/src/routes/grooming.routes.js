import { Router } from "express";
import { getAll, create, updateStatus } from "../controllers/grooming.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getAll);
router.post("/", requireAuth, create);
router.patch("/:id/status", requireStaff, updateStatus);

export default router;

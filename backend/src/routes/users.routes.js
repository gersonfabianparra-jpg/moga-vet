import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/users.controller.js";
import { requireStaff, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/",       requireStaff, getAll);
router.post("/",      requireAdmin, create);
router.put("/:id",    requireAdmin, update);
router.delete("/:id", requireAdmin, remove);

export default router;

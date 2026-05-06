import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/vaccines.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/",       requireAuth,  getAll);
router.post("/",      requireStaff, create);
router.patch("/:id",  requireStaff, update);
router.delete("/:id", requireStaff, remove);

export default router;

import { Router } from "express";
import { getAll, getById, create } from "../controllers/pets.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getAll);
router.get("/:id", requireAuth, getById);
router.post("/", requireStaff, create);

export default router;

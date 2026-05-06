import { Router } from "express";
import { getAll, getById, create, update, remove } from "../controllers/pets.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/",       requireAuth,  getAll);
router.get("/:id",    requireAuth,  getById);
router.post("/",      requireAuth,  create);
router.patch("/:id",  requireStaff, update);
router.delete("/:id", requireStaff, remove);

export default router;

import { Router } from "express";
import { getAll, create, updateStatus, remove } from "../controllers/grooming.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/",               requireAuth,  getAll);
router.post("/",              requireAuth,  create);
router.patch("/:id/status",   requireStaff, updateStatus);
router.delete("/:id",         requireStaff, remove);

export default router;

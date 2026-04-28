import { Router } from "express";
import { getAll, getByPet, create } from "../controllers/records.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getAll);
router.get("/pet/:petId", requireAuth, getByPet);
router.post("/", requireStaff, create);

export default router;

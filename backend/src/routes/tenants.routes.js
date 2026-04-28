import { Router } from "express";
import { getAll, register, updateStatus } from "../controllers/tenants.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);               // público — registro de nueva clínica
router.get("/",          requireAuth, getAll);    // solo superadmin
router.patch("/:id",     requireAuth, updateStatus);

export default router;

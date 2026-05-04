import { Router } from "express";
import { getAll, register, updateStatus, create, remove } from "../controllers/tenants.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);               // público — registro de nueva clínica
router.get("/",          requireAuth, getAll);
router.post("/",         requireAuth, create);    // superadmin crea clínica directamente
router.patch("/:id",     requireAuth, updateStatus);
router.delete("/:id",    requireAuth, remove);

export default router;

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAll, create, remove } from "../controllers/blockedSlots.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/",        getAll);
router.post("/",       create);
router.delete("/:id",  remove);

export default router;

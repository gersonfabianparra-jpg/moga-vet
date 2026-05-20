import { Router } from "express";
import { getAll, create, update, adjustStock, remove } from "../controllers/inventory.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/",                requireAuth,  getAll);
router.post("/",               requireStaff, create);
router.put("/:id",             requireStaff, update);
router.patch("/:id/adjust",    requireStaff, adjustStock);
router.delete("/:id",          requireStaff, remove);

export default router;

import { Router } from "express";
import { getAll, create, update, markPaid, abono, remove } from "../controllers/payments.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/",         requireAuth,  getAll);
router.post("/",        requireStaff, create);
router.put("/:id",      requireStaff, update);
router.patch("/:id/pay",  requireStaff, markPaid);
router.patch("/:id/abono",requireStaff, abono);
router.delete("/:id",   requireStaff, remove);

export default router;

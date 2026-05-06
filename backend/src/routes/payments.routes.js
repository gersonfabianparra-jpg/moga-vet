import { Router } from "express";
import { getAll, create, markPaid, remove } from "../controllers/payments.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/",         requireAuth,  getAll);
router.post("/",        requireStaff, create);
router.patch("/:id/pay",requireStaff, markPaid);
router.delete("/:id",   requireStaff, remove);

export default router;

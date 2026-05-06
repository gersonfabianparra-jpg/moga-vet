import { Router } from "express";
import { getGlobalStats, getUsersByTenant, resetPassword, deleteUserAdmin } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All routes require superadmin
function requireSuperadmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "superadmin") return res.status(403).json({ message: "Solo superadmin." });
    next();
  });
}

router.get("/stats",                   requireSuperadmin, getGlobalStats);
router.get("/users/:tenantId",         requireSuperadmin, getUsersByTenant);
router.post("/users/:id/reset-password", requireSuperadmin, resetPassword);
router.delete("/users/:id",            requireSuperadmin, deleteUserAdmin);

export default router;

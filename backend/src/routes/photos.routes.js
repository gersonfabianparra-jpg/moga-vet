import { Router } from "express";
import { getByPet, getByGrooming, upload, remove } from "../controllers/photos.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/pet/:petId",          requireAuth, getByPet);
router.get("/grooming/:groomingId", requireAuth, getByGrooming);
router.post("/",          requireStaff, upload);
router.delete("/:id",     requireStaff, remove);

export default router;

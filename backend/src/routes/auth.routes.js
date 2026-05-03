import { Router } from "express";
import { signup, login, logout, onboarding, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding", protectRoute, onboarding);
router.get("/me", protectRoute, getMe);

export default router;

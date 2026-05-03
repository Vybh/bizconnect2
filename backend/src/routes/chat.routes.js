import { Router } from "express";
import { getChatToken } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.js";

const router = Router();

router.get("/token", protectRoute, getChatToken);

export default router;

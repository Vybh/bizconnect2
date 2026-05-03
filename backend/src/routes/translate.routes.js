import { Router } from "express";
import { translate } from "../controllers/translate.controller.js";
import { protectRoute } from "../middleware/auth.js";

const router = Router();

router.post("/", protectRoute, translate);

export default router;

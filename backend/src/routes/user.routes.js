import { Router } from "express";
import {
  getRecommendedUsers,
  getAllUsers,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingRequests,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.js";

const router = Router();

router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/all", getAllUsers);
router.get("/friends", getFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingRequests);

export default router;

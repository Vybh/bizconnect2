import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUser = req.user;
    const users = await User.find({
      _id: { $ne: currentUser._id, $nin: currentUser.friends },
      isOnBoarded: true,
    }).select("-password");
    res.json({ users });
  } catch (err) {
    console.error("getRecommendedUsers error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isOnBoarded: true,
    }).select("-password");
    res.json({ users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "-password")
      .select("friends");
    res.json({ friends: user.friends });
  } catch (err) {
    console.error("getFriends error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const { id: recipientId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: "User not found" });

    if (req.user.friends.includes(recipientId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });
    if (existing) return res.status(400).json({ message: "Friend request already exists" });

    const request = await FriendRequest.create({ sender: senderId, recipient: recipientId });
    res.status(201).json({ request });
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const request = await FriendRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (request.status === "accepted") {
      return res.status(400).json({ message: "Already accepted" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.recipient },
    });
    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender },
    });

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incoming = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "-password");

    const accepted = await FriendRequest.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      status: "accepted",
    }).populate("sender recipient", "-password");

    res.json({ incoming, accepted });
  } catch (err) {
    console.error("getFriendRequests error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getOutgoingRequests(req, res) {
  try {
    const requests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "-password");
    res.json({ requests });
  } catch (err) {
    console.error("getOutgoingRequests error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

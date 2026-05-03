import { generateStreamToken } from "../lib/stream.js";

export async function getChatToken(req, res) {
  try {
    const token = generateStreamToken(req.user._id.toString());
    res.json({ token });
  } catch (err) {
    console.error("getChatToken error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
}

function setCookie(res, token) {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function safeUser(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

export async function signup(req, res) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ email, password, fullName });

    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic,
      });
    } catch (err) {
      console.error("Stream upsert failed:", err.message);
    }

    const token = signToken(user._id);
    setCookie(res, token);
    res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);
    setCookie(res, token);
    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function onboarding(req, res) {
  try {
    const {
      fullName,
      industry,
      location,
      experienceYears,
      description,
      pricing,
      nativeLanguage,
      learningLanguage,
      profilePic,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        industry,
        location,
        experienceYears,
        description,
        pricing,
        nativeLanguage,
        learningLanguage,
        ...(profilePic && { profilePic }),
        isOnBoarded: true,
      },
      { new: true }
    ).select("-password");

    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic,
      });
    } catch (err) {
      console.error("Stream upsert failed:", err.message);
    }

    res.json({ user });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMe(req, res) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

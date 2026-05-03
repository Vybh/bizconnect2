import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import translateRoutes from "./routes/translate.routes.js";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0,
});

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { message: "Too many requests, please try again later." },
    })
  );
}

app.get("/", (req, res) => res.json({ status: "ok", service: "BizConnect API" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/translate", translateRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

Sentry.setupExpressErrorHandler(app);

export default app;

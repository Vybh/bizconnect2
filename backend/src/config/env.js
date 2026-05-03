const required = [
  "MONGO_URI",
  "JWT_SECRET_KEY",
  "STREAM_API_KEY",
  "STREAM_API_SECRET",
];

export function validateEnv() {
  if (process.env.NODE_ENV === "test") return;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

import "dotenv/config";
import { validateEnv } from "./config/env.js";
import { connectDB } from "./lib/db.js";
import app from "./app.js";

validateEnv();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.info(`Server running on port ${PORT}`));
});

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import "./index.css";

Sentry.init({
  dsn: "https://ee230f111c11951d52737e7fb0cd0ecc@o4511325952671744.ingest.us.sentry.io/4511325953982464",
  sendDefaultPii: true,
  environment: import.meta.env.MODE,
});

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

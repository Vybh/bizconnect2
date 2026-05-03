import "@testing-library/jest-dom";

// Provide minimal import.meta.env for tests
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_API_BASE_URL: "http://localhost:5000",
    VITE_STREAM_API_KEY: "test-key",
    VITE_CLOUDINARY_CLOUD_NAME: "test-cloud",
    VITE_CLOUDINARY_UPLOAD_PRESET: "test-preset",
  },
  writable: true,
  configurable: true,
});

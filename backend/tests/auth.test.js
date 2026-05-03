import { jest } from "@jest/globals";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "test-secret-key";
process.env.STREAM_API_KEY = "test-stream-key";
process.env.STREAM_API_SECRET = "test-stream-secret";

jest.unstable_mockModule("../src/lib/stream.js", () => ({
  upsertStreamUser: jest.fn().mockResolvedValue(undefined),
  generateStreamToken: jest.fn().mockReturnValue("mock-stream-token"),
}));

const { default: app } = await import("../src/app.js");
const request = (await import("supertest")).default;
const { startDb, stopDb, clearDb } = await import("./setup.js");

beforeAll(async () => { await startDb(); });
afterAll(async () => { await stopDb(); });
afterEach(async () => { await clearDb(); });

describe("Auth — signup", () => {
  it("creates a user and returns no password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/signup").send({
      email: "dup@example.com",
      password: "password123",
      fullName: "Dup User",
    });
    const res = await request(app).post("/api/auth/signup").send({
      email: "dup@example.com",
      password: "password123",
      fullName: "Dup User 2",
    });
    expect(res.status).toBe(409);
  });

  it("rejects short password", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "short@example.com",
      password: "abc",
      fullName: "Short Pass",
    });
    expect(res.status).toBe(400);
  });
});

describe("Auth — login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/signup").send({
      email: "login@example.com",
      password: "password123",
      fullName: "Login User",
    });
  });

  it("logs in with valid credentials and returns no password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });
});

describe("Auth — logout", () => {
  it("clears the cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
  });
});

describe("Auth — /me", () => {
  it("returns current user without password when authenticated", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/signup").send({
      email: "me@example.com",
      password: "password123",
      fullName: "Me User",
    });
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

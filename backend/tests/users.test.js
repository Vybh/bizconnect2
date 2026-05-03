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

async function createAndLoginUser(agent, overrides = {}) {
  const data = {
    email: overrides.email || "user@example.com",
    password: "password123",
    fullName: overrides.fullName || "Test User",
  };
  await agent.post("/api/auth/signup").send(data);
  return data;
}

describe("Users — recommended", () => {
  it("returns only onboarded non-friend users excluding self", async () => {
    const agent = request.agent(app);
    await createAndLoginUser(agent);

    const agent2 = request.agent(app);
    await createAndLoginUser(agent2, { email: "other@example.com", fullName: "Other" });
    await agent2.post("/api/auth/onboarding").send({
      fullName: "Other",
      industry: "Tech",
      location: "NYC",
      experienceYears: 3,
      description: "Hello",
      pricing: 100,
      nativeLanguage: "en",
      learningLanguage: "es",
    });

    const res = await agent.get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
    const emails = res.body.users.map((u) => u.email);
    expect(emails).not.toContain("user@example.com");
    expect(emails).toContain("other@example.com");
    res.body.users.forEach((u) => expect(u.password).toBeUndefined());
  });
});

describe("Users — friend request flow", () => {
  it("sends and accepts a friend request", async () => {
    const agent1 = request.agent(app);
    const agent2 = request.agent(app);

    const res1 = await agent1.post("/api/auth/signup").send({
      email: "alice@example.com",
      password: "password123",
      fullName: "Alice",
    });
    const aliceId = res1.body.user._id;

    const res2 = await agent2.post("/api/auth/signup").send({
      email: "bob@example.com",
      password: "password123",
      fullName: "Bob",
    });
    const bobId = res2.body.user._id;

    const reqRes = await agent1.post(`/api/users/friend-request/${bobId}`);
    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.request._id;

    const acceptRes = await agent2.put(`/api/users/friend-request/${requestId}/accept`);
    expect(acceptRes.status).toBe(200);

    const friendsRes = await agent1.get("/api/users/friends");
    expect(friendsRes.status).toBe(200);
    const ids = friendsRes.body.friends.map((f) => f._id);
    expect(ids).toContain(bobId);
  });

  it("prevents duplicate friend requests", async () => {
    const agent1 = request.agent(app);
    const res2 = await request(app).post("/api/auth/signup").send({
      email: "charlie@example.com",
      password: "password123",
      fullName: "Charlie",
    });
    const charlieId = res2.body.user._id;

    await agent1.post("/api/auth/signup").send({
      email: "dave@example.com",
      password: "password123",
      fullName: "Dave",
    });

    await agent1.post(`/api/users/friend-request/${charlieId}`);
    const dup = await agent1.post(`/api/users/friend-request/${charlieId}`);
    expect(dup.status).toBe(400);
  });
});

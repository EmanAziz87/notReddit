import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import prisma from "../../../lib/prisma";
import app from "../../../index";
import { afterEach } from "node:test";

describe("Community Routes", () => {
  let agent: any;
  beforeAll(async () => {
    agent = request.agent(app);
    await prisma.followedCommunities.deleteMany();
    await prisma.communities.deleteMany();
    await prisma.users.deleteMany();

    await agent.post("/users/register").send({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
      birthdate: "1999-01-06",
    });
  });

  afterEach(async () => {
    await prisma.followedCommunities.deleteMany();
    await prisma.communities.deleteMany();
    await prisma.users.deleteMany();
  });

  afterAll(async () => {
    prisma.$disconnect;
  });

  describe("POST /communities/create", () => {
    beforeEach(async () => {
      await prisma.followedCommunities.deleteMany();
      await prisma.communities.deleteMany();
    });

    it("should successfully create a new post if user is authenticated", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      expect(response.status).toBe(201);
      expect(response.body.createdCommunity.name).toBe("learnProgramming");
      expect(response.body.createdCommunity.description).toBe(
        "a place to learn programming",
      );
      expect(response.body.createdCommunity.public).toBe(true);
    });
    it("should throw 401 if user is not authenticated", async () => {
      const response = await request(app).post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      expect(response.status).toBe(401);
    });

    it("should throw 409 if community already exists", async () => {
      await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      expect(response.status).toBe(409);
    });
  });

  describe("PUT /communities/edit/:id", () => {
    beforeEach(async () => {
      await prisma.followedCommunities.deleteMany();
      await prisma.communities.deleteMany();
    });

    it("should successfully edit an existing community", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      const response2 = await agent
        .put(`/communities/edit/${response.body.createdCommunity.id}`)
        .send({
          description: "a place to learn programming (updated)",
          public: false,
        });

      expect(response2.status).toBe(201);
      expect(response2.body.editedCommunity.description).toBe(
        "a place to learn programming (updated)",
      );
      expect(response2.body.editedCommunity.public).toBe(false);
    });

    it("should throw 401 if user is not authenticated", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      const response2 = await request(app)
        .put(`/communities/edit/${response.body.createdCommunity.id}`)
        .send({
          description: "a place to learn programming (updated)",
          public: false,
        });

      expect(response2.status).toBe(401);
    });
  });
  describe("GET /communities", () => {
    beforeAll(async () => {
      await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });
      await agent.post("/communities/create").send({
        name: "learnBoxing",
        description: "a place to learn boxing",
        public: false,
      });
      await agent.post("/communities/create").send({
        name: "learnPiano",
        description: "a place to learn piano",
        public: true,
      });
    });

    it("should successfully get all communities", async () => {
      const response = await agent.get("/communities");

      expect(response.status).toBe(200);
      expect(response.body.allCommunities.length).toBe(3);
    });
  });

  describe("GET /communities/:id", async () => {
    beforeEach(async () => {
      await prisma.followedCommunities.deleteMany();
      await prisma.communities.deleteMany();
    });

    it("should successfully grab a single community", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });
      const response2 = await agent.get(
        `/communities/${response.body.createdCommunity.id}`,
      );

      expect(response2.status).toBe(200);
      expect(response2.body.fetchedCommunity.name).toBe("learnProgramming");
    });
  });

  describe("PUT /communities/follow/:id", async () => {
    beforeEach(async () => {
      await prisma.followedCommunities.deleteMany();
      await prisma.communities.deleteMany();
    });
    it("Successfully follows a community when authenticated", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      const response2 = await agent.put(
        `/communities/follow/${response.body.createdCommunity.id}`,
      );

      expect(response2.status).toBe(201);
      expect(response2.body.followedCommunity.followers).toBe(1);
    });

    it("should throw 401 if unauthenticated", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      const response2 = await request(app).put(
        `/communities/follow/${response.body.createdCommunity.id}`,
      );

      expect(response2.status).toBe(401);
    });
  });

  describe("PUT /communities/unfollow/:id", async () => {
    beforeEach(async () => {
      await prisma.followedCommunities.deleteMany();
      await prisma.communities.deleteMany();
    });
    it("Successfully unfollow a community when authenticated", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      await agent.put(
        `/communities/follow/${response.body.createdCommunity.id}`,
      );

      const response3 = await agent.put(
        `/communities/unfollow/${response.body.createdCommunity.id}`,
      );
      expect(response3.status).toBe(201);
      expect(response3.body.unfollowedCommunity.followers).toBe(0);
    });

    it("should throw 401 if unauthenticated", async () => {
      const response = await agent.post("/communities/create").send({
        name: "learnProgramming",
        description: "a place to learn programming",
        public: true,
      });

      const response2 = await request(app).put(
        `/communities/unfollow/${response.body.createdCommunity.id}`,
      );

      expect(response2.status).toBe(401);
    });
  });
});

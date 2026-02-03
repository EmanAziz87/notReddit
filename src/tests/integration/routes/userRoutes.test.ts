import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../index";
import prisma from "../../../lib/prisma";
import {
  checkSessionIsDeleted,
  checkSessionLoginExists,
} from "../../util/sessionHelper";

describe("User Routes", () => {
  beforeAll(async () => {
    await prisma.users.deleteMany();
  });

  afterAll(async () => {
    await prisma.users.deleteMany();
    await prisma.$disconnect();
  });

  describe("POST /users/register", () => {
    it("should successfully register a new user and login", async () => {
      const response = await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        birthdate: "1999-01-06",
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("SUCCESS");
      expect(response.body.message).toBe("Registered and Logged in");
      checkSessionLoginExists(response);
    });

    it("should respond with a 409 if username already exists", async () => {
      await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        birthdate: "1999-01-06",
      });

      const secondRegistrationResponse = await request(app)
        .post("/users/register")
        .send({
          email: "test@example2.com",
          username: "testuser",
          password: "password12345",
          birthdate: "1997-05-08",
        });

      expect(secondRegistrationResponse.status).toBe(409);
      expect(secondRegistrationResponse.body.message).toBe(
        "Duplicate Already Exists",
      );

      await prisma.users.deleteMany();
    });

    it("should respond with a 409 if email already exists", async () => {
      await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        birthdate: "1999-01-06",
      });

      const secondRegistrationResponse = await request(app)
        .post("/users/register")
        .send({
          email: "test@example.com",
          username: "testuser2",
          password: "password12345",
          birthdate: "1997-05-08",
        });

      expect(secondRegistrationResponse.status).toBe(409);
      expect(secondRegistrationResponse.body.message).toBe(
        "Duplicate Already Exists",
      );
      await prisma.users.deleteMany();
    });

    it("should respond with 400 invalid request error if registration input does not have the exact required properties", async () => {
      const response = await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        birthdate: "1997-05-08",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("VALIDATION_ERROR");
      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe("POST /users/login", () => {
    beforeAll(async () => {
      await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        birthdate: "1997-05-08",
      });
    });

    afterAll(async () => {
      await prisma.users.deleteMany();
    });

    it("should successfully login", async () => {
      const response = await request(app).post("/users/login").send({
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("SUCCESS");
      checkSessionLoginExists(response);
    });

    it("should respond with 401 with invalid username or password", async () => {
      const response = await request(app).post("/users/login").send({
        username: "testuser",
        password: "password321",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /users/logout", () => {
    beforeAll(async () => {});

    afterAll(async () => {
      await prisma.users.deleteMany();
    });

    it("should successfully logout", async () => {
      await request(app).post("/users/register").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        birthdate: "1997-05-08",
      });

      const logoutResponse = await request(app).delete("/users/logout");

      checkSessionIsDeleted(logoutResponse);
    });
  });
});

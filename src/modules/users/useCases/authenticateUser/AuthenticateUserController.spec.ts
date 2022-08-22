import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "User Supertest",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "User Supertest",
      password: "1234",
    });

    expect(response.body.user).toHaveProperty("email", "User Supertest");
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate an unexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "Fake_user",
      password: "1234",
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate an user with an incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "User Supertest",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "User Supertest",
      password: "123",
    });

    expect(response.status).toBe(401);
  });
});

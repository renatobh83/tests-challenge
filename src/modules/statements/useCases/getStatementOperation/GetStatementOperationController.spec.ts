import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able get an statement from an user account", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "User Supertest",
      password: "1234",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "User Supertest",
      password: "1234",
    });

    const { token } = auth.body;

    const statement = {
      amount: 100.0,
      description: "Deposit test",
    };

    const createdStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send(statement)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement_id = createdStatement.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("description", statement.description);
    expect(response.body).toHaveProperty("amount", statement.amount.toFixed(2));
  });

  it("Should not be able get an statement from an unexistent user account", async () => {
    const token = "fake_token";

    const statement_id = "fake_statement_id";

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });

  it("Should not be able get an unexistent statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user2",
      email: "User Supertest2",
      password: "1234",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "User Supertest2",
      password: "1234",
    });

    const { token } = auth.body;

    const statement_id = "335cd5e290807fd304c6b635e7cb0c5c";

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});

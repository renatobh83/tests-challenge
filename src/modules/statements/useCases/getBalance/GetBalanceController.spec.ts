import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get balance controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able get the balance from an user account", async () => {
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

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("balance", 100);
  });

  it("Should not be able get the balance from an unexistent user account", async () => {
    const token = "fake_token";

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);
  });

  it("Should be able to take into account all tranfers made and received by user when calculating the account's balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Della Stokes",
      email: "muvegpe@merodoca.ma",
      password: "1234",
    });

    await request(app).post("/api/v1/users").send({
      name: "Alex Todd",
      email: "aldepha@molguhak.bm",
      password: "1234",
    });

    const user1_auth = await request(app).post("/api/v1/sessions").send({
      email: "muvegpe@merodoca.ma",
      password: "1234",
    });

    const user2_auth = await request(app).post("/api/v1/sessions").send({
      email: "aldepha@molguhak.bm",
      password: "1234",
    });

    const { token: user1_token } = user1_auth.body;

    const { token: user2_token } = user2_auth.body;

    const user1_id = (
      await request(app)
        .get("/api/v1/profile")
        .send()
        .set({
          Authorization: `Bearer ${user1_token}`,
        })
    ).body.id;

    const user2_id = (
      await request(app)
        .get("/api/v1/profile")
        .send()
        .set({
          Authorization: `Bearer ${user2_token}`,
        })
    ).body.id;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 900,
        description: "Deposit test",
      })
      .set({
        Authorization: `Bearer ${user1_token}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfer/${user2_id}`)
      .send({
        amount: 500,
        description: "Transfer test",
      })
      .set({
        Authorization: `Bearer ${user1_token}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfer/${user1_id}`)
      .send({
        amount: 100,
        description: "Transfer test 2",
      })
      .set({
        Authorization: `Bearer ${user2_token}`,
      });

    // funds check
    const user1_balance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${user1_token}`,
      });

    const user2_balance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${user2_token}`,
      });

    expect(user1_balance.body).toHaveProperty("balance", 500);
    expect(user2_balance.body).toHaveProperty("balance", 400);
  });
});

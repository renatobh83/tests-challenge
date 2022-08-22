import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create transfer statement controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to transfer credits from one user to another", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test user",
      email: "User Supertest",
      password: "1234",
    });

    await request(app).post("/api/v1/users").send({
      name: "Carolyn Davis",
      email: "ap@ejisefoz.hu",
      password: "1234",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "User Supertest",
      password: "1234",
    });

    const { token } = auth.body;

    const sender_id = (
      await request(app)
        .get("/api/v1/profile")
        .send()
        .set({
          Authorization: `Bearer ${token}`,
        })
    ).body.id;

    const recipient_auth = await request(app).post("/api/v1/sessions").send({
      email: "ap@ejisefoz.hu",
      password: "1234",
    });

    const { token: recipient_token } = recipient_auth.body;

    const recipient_id = (
      await request(app)
        .get("/api/v1/profile")
        .send()
        .set({
          Authorization: `Bearer ${recipient_token}`,
        })
    ).body.id;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const transfer = await request(app)
      .post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 100,
        description: "Transfer test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const sender_balance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    const recipient_balance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${recipient_token}`,
      });

    expect(sender_balance.body).toHaveProperty("balance", 100);
    expect(recipient_balance.body).toHaveProperty("balance", 100);
    expect(transfer.body).toHaveProperty("sender_id", sender_id);
    expect(transfer.body).toHaveProperty("type", "transfer");
  });

  it("Should not be able to transfer more credits than available", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Maud Salazar",
      email: "bekos@ib.dz",
      password: "1234",
    });

    await request(app).post("/api/v1/users").send({
      name: "Wayne Ballard",
      email: "sodemo@mofa.mv",
      password: "1234",
    });

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "bekos@ib.dz",
      password: "1234",
    });

    const { token } = auth.body;

    const auth2 = await request(app).post("/api/v1/sessions").send({
      email: "sodemo@mofa.mv",
      password: "1234",
    });

    const { token: token2 } = auth2.body;

    const user2_id = (
      await request(app)
        .get("/api/v1/profile")
        .send()
        .set({
          Authorization: `Bearer ${token2}`,
        })
    ).body.id;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user2_id}`)
      .send({
        amount: 100,
        description: "Transfer test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});

import { expect } from "chai";
import request from "supertest";
import app from "../../src/app.js";

import UserModel from "../../src/models/user.model.js";
import StoreModel from "../../src/models/store.model.js";
import OrderModel from "../../src/models/order.model.js";
import DeliveryModel from "../../src/models/delivery.model.js";

describe("Mocks", function () {
  let existingIds;

  const models = [UserModel, StoreModel, OrderModel, DeliveryModel];

  // Guardamos los IDs existentes para eliminar solamente
  // los documentos nuevos creados durante cada prueba.
  beforeEach(async function () {
    existingIds = await Promise.all(
      models.map((model) => model.distinct("_id")),
    );
  });

  afterEach(async function () {
    for (let i = 0; i < models.length; i++) {
      const previousIds = new Set(existingIds[i].map((id) => id.toString()));

      const currentDocuments = await models[i].find({}, "_id");

      const newIds = currentDocuments
        .filter((document) => !previousIds.has(document._id.toString()))
        .map((document) => document._id);

      if (newIds.length > 0) {
        await models[i].deleteMany({
          _id: { $in: newIds },
        });
      }
    }
  });

  describe("GET /api/mocks/users", function () {
    it("debe generar la cantidad solicitada de usuarios", async function () {
      const response = await request(app).get("/api/mocks/users?qty=3");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(3);
      expect(response.body.payload[0]).to.have.property("email");
      expect(response.body.payload[0]).to.not.have.property("password");
    });

    it("debe devolver 400 si la cantidad es inválida", async function () {
      const response = await request(app).get("/api/mocks/users?qty=0");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
    });
  });

  describe("GET /api/mocks/couriers", function () {
    it("debe generar la cantidad solicitada de repartidores", async function () {
      const response = await request(app).get("/api/mocks/couriers?qty=2");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(2);
      expect(response.body.payload[0].role).to.equal("COURIER");
      expect(response.body.payload[0]).to.not.have.property("password");
    });
  });

  describe("GET /api/mocks/orders", function () {
    it("debe generar la cantidad solicitada de pedidos", async function () {
      const response = await request(app).get("/api/mocks/orders?qty=2");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(2);
      expect(response.body.payload[0]).to.have.property("customer");
      expect(response.body.payload[0]).to.have.property("store");
    });
  });

  describe("GET /api/mocks/deliveries", function () {
    it("debe generar la cantidad solicitada de entregas", async function () {
      const response = await request(app).get("/api/mocks/deliveries?qty=2");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(2);
      expect(response.body.payload[0]).to.have.property("order");
      expect(response.body.payload[0]).to.have.property("courier");
    });
  });

  describe("POST /api/mocks/seed", function () {
    it("debe insertar los datos ficticios en la base de datos", async function () {
      const response = await request(app).post("/api/mocks/seed?qty=2");

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");

      expect(response.body.payload.insertados).to.deep.equal({
        usuarios: 2,
        repartidores: 2,
        comercios: 2,
        pedidos: 2,
        entregas: 2,
      });
    });

    it("debe devolver 400 si la cantidad solicitada es inválida", async function () {
      const response = await request(app).post("/api/mocks/seed?qty=101");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("INVALID_MOCK_AMOUNT");
    });
  });
});

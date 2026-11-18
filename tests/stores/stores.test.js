import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app.js";
import UserModel from "../../src/models/user.model.js";
import StoreModel from "../../src/models/store.model.js";

describe("Comercios", function () {
  let testUser;
  let testStore;

  before(async function () {
    testUser = await UserModel.create({
      firstName: "Usuario",
      lastName: "StoresTest",
      email: `stores-${new mongoose.Types.ObjectId()}@example.com`,
      password: "password123",
    });

    testStore = await StoreModel.create({
      name: "Comercio de prueba",
      address: "Paraná",
      owner: testUser._id,
    });
  });

  after(async function () {
    if (testStore) {
      await StoreModel.deleteOne({ _id: testStore._id });
    }

    if (testUser) {
      await UserModel.deleteOne({ _id: testUser._id });
    }
  });

  describe("GET /api/stores", function () {
    it("debe devolver una lista de comercios con metadatos de paginación", async function () {
      const response = await request(app).get("/api/stores");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
      expect(response.body.pagination).to.be.an("object");
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(10);
      expect(response.body.pagination.total).to.be.at.least(1);
      expect(response.body.pagination).to.have.property("totalPages");
    });

    it("debe respetar los parámetros page y limit", async function () {
      const response = await request(app).get("/api/stores?page=1&limit=1");

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.be.an("array");
      expect(response.body.payload.length).to.be.at.most(1);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(1);
    });

    it("debe devolver 400 si page es inválido", async function () {
      const response = await request(app).get("/api/stores?page=0");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("debe devolver 400 si limit supera el máximo permitido", async function () {
      const response = await request(app).get("/api/stores?limit=101");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });

  describe("POST /api/stores", function () {
    it("debe rechazar campos que no están permitidos", async function () {
      const response = await request(app).post("/api/stores").send({
        name: "Comercio inválido",
        address: "Paraná",
        owner: testUser._id.toString(),
        isActive: false,
      });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/stores/:sid", function () {
    it("debe rechazar modificaciones del campo isActive", async function () {
      const response = await request(app)
        .put(`/api/stores/${testStore._id}`)
        .send({ isActive: false });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });
});

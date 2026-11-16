import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app.js";
import UserModel from "../../src/models/user.model.js";
import StoreModel from "../../src/models/store.model.js";
import OrderModel from "../../src/models/order.model.js";

describe("Pedidos", function () {
  let testUser;
  let testStore;

  const orderData = () => ({
    customer: testUser._id.toString(),
    store: testStore._id.toString(),
    items: [
      {
        name: "Producto de prueba",
        quantity: 2,
        price: 1500,
      },
    ],
    deliveryAddress: "Calle de prueba 123",
  });

  before(async function () {
    testUser = await UserModel.create({
      firstName: "Usuario",
      lastName: "Testing",
      email: `testing-${new mongoose.Types.ObjectId()}@example.com`,
      password: "password123",
    });

    testStore = await StoreModel.create({
      name: "Comercio de testing",
      address: "Dirección de prueba 123",
      owner: testUser._id,
    });
  });

  after(async function () {
    await OrderModel.deleteMany({ customer: testUser._id });
    await StoreModel.deleteOne({ _id: testStore._id });
    await UserModel.deleteOne({ _id: testUser._id });
  });

  describe("GET /api/orders", function () {
    it("debe devolver HTTP 200 y una lista de pedidos", async function () {
      const response = await request(app).get("/api/orders");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
    });
  });

  describe("POST /api/orders", function () {
    it("debe crear un pedido correctamente", async function () {
      const response = await request(app).post("/api/orders").send(orderData());

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.have.property("_id");
      expect(response.body.payload.total).to.equal(3000);
      expect(response.body.payload.status).to.equal("created");
    });

    it("debe devolver 400 si faltan datos obligatorios", async function () {
      const response = await request(app).post("/api/orders").send({});

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("ORDER_REQUIRED_FIELDS");
    });
  });

  describe("GET /api/orders/:oid", function () {
    it("debe devolver un pedido existente", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const response = await request(app).get(`/api/orders/${order._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload._id).to.equal(order._id.toString());
      expect(response.body.payload.customer).to.have.property("email");
      expect(response.body.payload.store).to.have.property("name");
    });

    it("debe devolver 404 si el pedido no existe", async function () {
      const nonexistentId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/orders/${nonexistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("ORDER_NOT_FOUND");
    });
  });

  describe("PUT /api/orders/:oid/status", function () {
    it("debe actualizar el estado de un pedido", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const response = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .send({ status: "delivered" });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.status).to.equal("delivered");
    });

    it("debe devolver 400 si el estado no es válido", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const response = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .send({ status: "invalid_status" });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("INVALID_ORDER_STATUS");
      expect(response.body.details.validStatuses).to.include("created");
    });
  });
});

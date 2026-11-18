import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { unlink } from "node:fs/promises";
import app from "../../src/app.js";
import UserModel from "../../src/models/user.model.js";
import StoreModel from "../../src/models/store.model.js";
import OrderModel from "../../src/models/order.model.js";

describe("Pedidos", function () {
  let testUser;
  let testStore;
  let uploadedFilePath;

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
    if (uploadedFilePath) {
      await unlink(uploadedFilePath).catch(() => {});
    }

    await OrderModel.deleteMany({ customer: testUser._id });
    await StoreModel.deleteOne({ _id: testStore._id });
    await UserModel.deleteOne({ _id: testUser._id });
  });

  describe("GET /api/orders", function () {
    it("debe devolver una lista de pedidos con metadatos de paginación", async function () {
      const response = await request(app).get("/api/orders");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
      expect(response.body.pagination).to.be.an("object");
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(10);
      expect(response.body.pagination).to.have.property("total");
      expect(response.body.pagination).to.have.property("totalPages");
    });

    it("debe respetar los parámetros page y limit", async function () {
      const response = await request(app).get("/api/orders?page=1&limit=1");

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.be.an("array");
      expect(response.body.payload.length).to.be.at.most(1);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(1);
    });

    it("debe devolver 400 si page es inválido", async function () {
      const response = await request(app).get("/api/orders?page=0");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("debe devolver 400 si limit supera el máximo permitido", async function () {
      const response = await request(app).get("/api/orders?limit=101");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
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

  describe("POST /api/orders/:oid/proof", function () {
    it("debe cargar correctamente un comprobante del pedido", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const response = await request(app)
        .post(`/api/orders/${order._id}/proof`)
        .attach("proof", Buffer.from("%PDF-1.4 comprobante de prueba"), {
          filename: "comprobante.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");

      const proof = response.body.payload.proof;

      expect(proof.originalName).to.equal("comprobante.pdf");
      expect(proof.mimeType).to.equal("application/pdf");
      expect(proof.type).to.equal("delivery_proof");
      expect(proof).to.have.property("fileName");
      expect(proof).to.have.property("path");

      uploadedFilePath = proof.path;
    });

    it("debe devolver 400 si no se adjunta un comprobante", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const response = await request(app).post(
        `/api/orders/${order._id}/proof`,
      );

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("FILE_REQUIRED");
    });

    it("debe devolver 400 si el tipo de archivo no está permitido", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const response = await request(app)
        .post(`/api/orders/${order._id}/proof`)
        .attach("proof", Buffer.from("archivo de texto"), {
          filename: "comprobante.txt",
          contentType: "text/plain",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("INVALID_FILE_TYPE");
    });

    it("debe devolver 400 si el archivo supera los 5 MB", async function () {
      const order = await OrderModel.create({
        ...orderData(),
        total: 3000,
      });

      const largeFile = Buffer.alloc(5 * 1024 * 1024 + 1);

      const response = await request(app)
        .post(`/api/orders/${order._id}/proof`)
        .attach("proof", largeFile, {
          filename: "comprobante-grande.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("FILE_TOO_LARGE");
    });

    it("debe devolver 404 si el pedido no existe", async function () {
      const nonexistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/orders/${nonexistentId}/proof`)
        .attach("proof", Buffer.from("%PDF-1.4 comprobante de prueba"), {
          filename: "comprobante.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("ORDER_NOT_FOUND");
    });
  });
});

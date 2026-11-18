import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { unlink } from "node:fs/promises";
import app from "../../src/app.js";

import UserModel from "../../src/models/user.model.js";
import StoreModel from "../../src/models/store.model.js";
import OrderModel from "../../src/models/order.model.js";
import DeliveryModel from "../../src/models/delivery.model.js";

describe("Entregas", function () {
  let testUser;
  let testCourier;
  let testStore;
  const orderIds = [];
  const uploadedFiles = [];

  const createOrder = async (status = "created") => {
    const order = await OrderModel.create({
      customer: testUser._id,
      store: testStore._id,
      items: [
        {
          name: "Producto de prueba",
          quantity: 2,
          price: 1500,
        },
      ],
      deliveryAddress: "Calle de prueba 123",
      total: 3000,
      status,
    });

    orderIds.push(order._id);
    return order;
  };

  const createDelivery = async () => {
    const order = await createOrder();

    const response = await request(app)
      .post("/api/deliveries")
      .send({ order: order._id.toString() });

    expect(response.status).to.equal(201);

    return {
      order,
      delivery: response.body.payload,
    };
  };

  before(async function () {
    const uniqueId = new mongoose.Types.ObjectId();

    testUser = await UserModel.create({
      firstName: "Usuario",
      lastName: "Testing",
      email: `delivery-user-${uniqueId}@example.com`,
      password: "password123",
    });

    testCourier = await UserModel.create({
      firstName: "Repartidor",
      lastName: "Testing",
      email: `delivery-courier-${uniqueId}@example.com`,
      password: "password123",
      role: "COURIER",
    });

    testStore = await StoreModel.create({
      name: "Comercio de entregas",
      address: "Dirección de prueba 123",
      owner: testUser._id,
    });
  });

  after(async function () {
    await DeliveryModel.deleteMany({
      order: { $in: orderIds },
    });

    await OrderModel.deleteMany({
      _id: { $in: orderIds },
    });

    await StoreModel.deleteOne({ _id: testStore._id });

    await UserModel.deleteMany({
      _id: { $in: [testUser._id, testCourier._id] },
    });

    await Promise.all(
      uploadedFiles.map((filePath) => unlink(filePath).catch(() => {})),
    );
  });

  describe("GET /api/deliveries", function () {
    it("debe devolver entregas con metadatos de paginación", async function () {
      const response = await request(app).get("/api/deliveries");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
      expect(response.body.pagination).to.have.property("page", 1);
      expect(response.body.pagination).to.have.property("limit", 10);
      expect(response.body.pagination).to.have.property("total");
      expect(response.body.pagination).to.have.property("totalPages");
    });

    it("debe rechazar parámetros de paginación inválidos", async function () {
      const response = await request(app).get("/api/deliveries?page=0");

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });

  describe("POST /api/deliveries", function () {
    it("debe crear una entrega pendiente con historial inicial", async function () {
      const order = await createOrder();

      const response = await request(app)
        .post("/api/deliveries")
        .send({ order: order._id.toString() });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.status).to.equal("pending");
      expect(response.body.payload.history).to.have.lengthOf(1);
      expect(response.body.payload.history[0].status).to.equal("pending");
    });

    it("debe impedir crear dos entregas para el mismo pedido", async function () {
      const { order } = await createDelivery();

      const response = await request(app)
        .post("/api/deliveries")
        .send({ order: order._id.toString() });

      expect(response.status).to.equal(409);
      expect(response.body.error).to.equal("DELIVERY_ALREADY_EXISTS");
    });

    it("debe rechazar pedidos que no estén en estado created", async function () {
      const order = await createOrder("assigned");

      const response = await request(app)
        .post("/api/deliveries")
        .send({ order: order._id.toString() });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("DELIVERY_ORDER_NOT_AVAILABLE");
    });

    it("debe devolver 404 si el pedido no existe", async function () {
      const nonexistentOrder = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post("/api/deliveries")
        .send({ order: nonexistentOrder.toString() });

      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal("ORDER_NOT_FOUND");
    });

    it("debe devolver 400 si falta el pedido", async function () {
      const response = await request(app).post("/api/deliveries").send({});

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });

  describe("GET /api/deliveries/:did", function () {
    it("debe devolver una entrega existente", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app).get(
        `/api/deliveries/${delivery._id}`,
      );

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.status).to.equal("pending");
      expect(response.body.payload.order).to.have.property("customer");
    });

    it("debe devolver 400 si el ID es inválido", async function () {
      const response = await request(app).get("/api/deliveries/id-invalido");

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("INVALID_ID");
    });

    it("debe devolver 404 si la entrega no existe", async function () {
      const nonexistentId = new mongoose.Types.ObjectId();

      const response = await request(app).get(
        `/api/deliveries/${nonexistentId}`,
      );

      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal("DELIVERY_NOT_FOUND");
    });
  });

  describe("PUT /api/deliveries/:did/assign", function () {
    it("debe asignar un repartidor y actualizar el pedido", async function () {
      const { order, delivery } = await createDelivery();

      const response = await request(app)
        .put(`/api/deliveries/${delivery._id}/assign`)
        .send({
          courier: testCourier._id.toString(),
          note: "Repartidor asignado para la prueba",
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.status).to.equal("assigned");
      expect(response.body.payload.courier.role).to.equal("COURIER");

      const updatedOrder = await OrderModel.findById(order._id);

      expect(updatedOrder.status).to.equal("assigned");
    });

    it("debe rechazar la asignación de un usuario que no sea repartidor", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app)
        .put(`/api/deliveries/${delivery._id}/assign`)
        .send({
          courier: testUser._id.toString(),
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("INVALID_COURIER");
    });

    it("debe rechazar una asignación sin repartidor", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app)
        .put(`/api/deliveries/${delivery._id}/assign`)
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("INVALID_COURIER");
    });
  });

  describe("PUT /api/deliveries/:did/status", function () {
    it("debe rechazar una transición que no está permitida", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app)
        .put(`/api/deliveries/${delivery._id}/status`)
        .send({ status: "delivered" });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("INVALID_DELIVERY_TRANSITION");
    });

    it("debe rechazar un estado inexistente", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app)
        .put(`/api/deliveries/${delivery._id}/status`)
        .send({ status: "invalid_status" });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("INVALID_DELIVERY_STATUS");
    });

    it("debe completar el ciclo de una entrega y sincronizar el pedido", async function () {
      this.timeout(30000);

      const { order, delivery } = await createDelivery();

      const assignResponse = await request(app)
        .put(`/api/deliveries/${delivery._id}/assign`)
        .send({ courier: testCourier._id.toString() });

      expect(assignResponse.status).to.equal(200);

      const transitions = [
        { status: "picked_up", orderStatus: "picked_up" },
        { status: "in_transit", orderStatus: "in_transit" },
        { status: "delivered", orderStatus: "delivered" },
      ];

      for (const transition of transitions) {
        const response = await request(app)
          .put(`/api/deliveries/${delivery._id}/status`)
          .send({
            status: transition.status,
            note: `Cambio a ${transition.status}`,
          });

        expect(response.status).to.equal(200);
        expect(response.body.payload.status).to.equal(transition.status);

        const updatedOrder = await OrderModel.findById(order._id);

        expect(updatedOrder.status).to.equal(transition.orderStatus);
      }

      const completedDelivery = await DeliveryModel.findById(delivery._id);

      expect(completedDelivery.deliveredAt).to.be.instanceOf(Date);
      expect(
        completedDelivery.history.map((entry) => entry.status),
      ).to.deep.equal([
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
      ]);
    });

    it("debe permitir cancelar una entrega asignada y cancelar el pedido", async function () {
      const { order, delivery } = await createDelivery();

      const assignResponse = await request(app)
        .put(`/api/deliveries/${delivery._id}/assign`)
        .send({ courier: testCourier._id.toString() });

      expect(assignResponse.status).to.equal(200);

      const cancelResponse = await request(app)
        .put(`/api/deliveries/${delivery._id}/status`)
        .send({
          status: "cancelled",
          note: "Cancelación de prueba",
        });

      expect(cancelResponse.status).to.equal(200);
      expect(cancelResponse.body.payload.status).to.equal("cancelled");

      const updatedOrder = await OrderModel.findById(order._id);

      expect(updatedOrder.status).to.equal("cancelled");
    });
  });

  describe("GET /api/deliveries/:did/tracking", function () {
    it("debe devolver el seguimiento y el historial de una entrega", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app).get(
        `/api/deliveries/${delivery._id}/tracking`,
      );

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.have.property("deliveryId");
      expect(response.body.payload.status).to.equal("pending");
      expect(response.body.payload.history).to.be.an("array").with.lengthOf(1);
    });
  });

  describe("POST /api/deliveries/:did/proof", function () {
    it("debe cargar correctamente un comprobante PDF", async function () {
      const { delivery } = await createDelivery();

      const pdfBuffer = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF",
      );

      const response = await request(app)
        .post(`/api/deliveries/${delivery._id}/proof`)
        .attach("proof", pdfBuffer, {
          filename: "comprobante-entrega.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.proof).to.exist;
      expect(response.body.payload.proof.originalName).to.equal(
        "comprobante-entrega.pdf",
      );
      expect(response.body.payload.proof.mimeType).to.equal("application/pdf");
      expect(response.body.payload.proof.type).to.equal("delivery_proof");
      expect(response.body.payload.proof.fileName).to.be.a("string");
      expect(response.body.payload.proof.path).to.be.a("string");
      expect(response.body.payload.proof.size).to.be.greaterThan(0);

      uploadedFiles.push(response.body.payload.proof.path);
    });

    it("debe rechazar la carga si no se envía ningún archivo", async function () {
      const { delivery } = await createDelivery();

      const response = await request(app).post(
        `/api/deliveries/${delivery._id}/proof`,
      );

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("FILE_REQUIRED");
    });

    it("debe rechazar un archivo cuyo contenido no coincide con su extensión", async function () {
      const { delivery } = await createDelivery();

      const invalidBuffer = Buffer.from("esto no es un PDF");

      const response = await request(app)
        .post(`/api/deliveries/${delivery._id}/proof`)
        .attach("proof", invalidBuffer, {
          filename: "comprobante-falso.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal("INVALID_FILE_CONTENT");
    });
  });
});

import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app.js";
import UserModel from "../../src/models/user.model.js";
import StoreModel from "../../src/models/store.model.js";
import ProductModel from "../../src/models/product.model.js";
import { PRODUCT_STATUS } from "../../src/constants/index.js";

describe("Productos", function () {
  let testUser;
  let testStore;
  let availableProduct;
  let outOfStockProduct;

  before(async function () {
    testUser = await UserModel.create({
      firstName: "Usuario",
      lastName: "ProductsTest",
      email: `products-${new mongoose.Types.ObjectId()}@example.com`,
      password: "password123",
    });

    testStore = await StoreModel.create({
      name: "Comercio de productos de prueba",
      address: "Paraná",
      owner: testUser._id,
    });

    availableProduct = await ProductModel.create({
      name: "Producto disponible de prueba",
      description: "Producto para probar la API",
      price: 1000,
      stock: 10,
      store: testStore._id,
      status: PRODUCT_STATUS.AVAILABLE,
    });

    outOfStockProduct = await ProductModel.create({
      name: "Producto sin stock de prueba",
      description: "Producto para probar filtros",
      price: 2000,
      stock: 0,
      store: testStore._id,
      status: PRODUCT_STATUS.OUT_OF_STOCK,
    });
  });

  after(async function () {
    if (availableProduct || outOfStockProduct) {
      await ProductModel.deleteMany({
        store: testStore._id,
      });
    }

    if (testStore) {
      await StoreModel.deleteOne({ _id: testStore._id });
    }

    if (testUser) {
      await UserModel.deleteOne({ _id: testUser._id });
    }
  });

  describe("GET /api/products", function () {
    it("debe devolver productos disponibles con metadatos de paginación", async function () {
      const response = await request(app)
        .get("/api/products")
        .query({ store: testStore._id.toString() });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
      expect(response.body.pagination).to.be.an("object");
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(10);
      expect(response.body.pagination.total).to.equal(1);
      expect(response.body.pagination.totalPages).to.equal(1);

      expect(
        response.body.payload.every(
          (product) => product.status === PRODUCT_STATUS.AVAILABLE,
        ),
      ).to.equal(true);
    });

    it("debe incluir productos sin stock cuando includeOutOfStock=true", async function () {
      const response = await request(app).get("/api/products").query({
        store: testStore._id.toString(),
        includeOutOfStock: "true",
      });

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.be.an("array");
      expect(response.body.pagination.total).to.equal(2);

      const statuses = response.body.payload.map((product) => product.status);

      expect(statuses).to.include(PRODUCT_STATUS.AVAILABLE);
      expect(statuses).to.include(PRODUCT_STATUS.OUT_OF_STOCK);
    });

    it("debe respetar los parámetros page y limit", async function () {
      const response = await request(app).get("/api/products").query({
        store: testStore._id.toString(),
        includeOutOfStock: "true",
        page: 1,
        limit: 1,
      });

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.be.an("array");
      expect(response.body.payload.length).to.equal(1);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(1);
      expect(response.body.pagination.total).to.equal(2);
    });

    it("debe filtrar los productos por comercio", async function () {
      const response = await request(app).get("/api/products").query({
        store: testStore._id.toString(),
        includeOutOfStock: "true",
      });

      expect(response.status).to.equal(200);
      expect(response.body.pagination.total).to.equal(2);

      response.body.payload.forEach((product) => {
        expect(product.store._id.toString()).to.equal(testStore._id.toString());
      });
    });

    it("debe devolver 400 si page es inválido", async function () {
      const response = await request(app).get("/api/products?page=0");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("debe devolver 400 si limit supera el máximo permitido", async function () {
      const response = await request(app).get("/api/products?limit=101");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });
});

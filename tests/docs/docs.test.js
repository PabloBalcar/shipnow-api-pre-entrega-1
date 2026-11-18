import { expect } from "chai";
import request from "supertest";
import app from "../../src/app.js";

describe("Documentación Swagger", function () {
  describe("GET /api/docs", function () {
    it("debe mostrar la documentación de la API", async function () {
      const response = await request(app).get("/api/docs/");

      expect(response.status).to.equal(200);
      expect(response.headers["content-type"]).to.include("text/html");
      expect(response.text).to.include("swagger-ui");
    });
  });

  describe("GET /api/docs.json", function () {
    let specification;

    before(async function () {
      const response = await request(app).get("/api/docs.json");

      expect(response.status).to.equal(200);
      expect(response.body.openapi).to.equal("3.0.0");

      specification = response.body;
    });

    it("debe devolver la especificación OpenAPI", function () {
      expect(specification.info.title).to.equal("ShipNow API");
      expect(specification.paths).to.be.an("object");
      expect(specification.components.schemas).to.be.an("object");
    });

    it("debe documentar las operaciones CRUD principales", function () {
      expect(specification.paths).to.have.property("/api/users");
      expect(specification.paths).to.have.property("/api/users/{uid}");

      expect(specification.paths).to.have.property("/api/stores");
      expect(specification.paths).to.have.property("/api/stores/{sid}");

      expect(specification.paths).to.have.property("/api/products");
      expect(specification.paths).to.have.property("/api/products/{pid}");

      expect(specification.paths).to.have.property("/api/orders");
      expect(specification.paths).to.have.property("/api/orders/{oid}");
    });

    it("debe documentar las cargas de archivos", function () {
      expect(specification.paths).to.have.property(
        "/api/users/{uid}/documents",
      );

      expect(specification.paths).to.have.property("/api/orders/{oid}/proof");
    });

    it("debe documentar los endpoints de salud", function () {
      expect(specification.paths).to.have.property("/health");
      expect(specification.paths).to.have.property("/api/health");
    });

    it("debe incluir los esquemas principales", function () {
      const schemas = specification.components.schemas;

      expect(schemas).to.have.property("User");
      expect(schemas).to.have.property("Product");
      expect(schemas).to.have.property("Store");
      expect(schemas).to.have.property("Order");
      expect(schemas).to.have.property("Delivery");
      expect(schemas).to.have.property("ErrorResponse");
      expect(schemas).to.have.property("SuccessResponse");
      expect(schemas).to.have.property("Pagination");
      expect(schemas).to.have.property("HealthResponse");
    });

    it("debe documentar la paginación de los listados", function () {
      const paths = [
        "/api/users",
        "/api/stores",
        "/api/products",
        "/api/orders",
      ];

      for (const path of paths) {
        const parameters = specification.paths[path].get.parameters;

        expect(
          parameters.some((parameter) => parameter.name === "page"),
        ).to.equal(true);

        expect(
          parameters.some((parameter) => parameter.name === "limit"),
        ).to.equal(true);
      }
    });
  });
});

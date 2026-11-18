import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Aplicación", function () {
  describe("Health check", function () {
    it("debe devolver 200 cuando la aplicación y MongoDB están disponibles", async function () {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.environment).to.equal("test");
      expect(response.body.database).to.equal("connected");
      expect(response.body.uptime).to.be.a("number");
      expect(response.body.timestamp).to.be.a("string");
      expect(new Date(response.body.timestamp).toISOString()).to.equal(
        response.body.timestamp,
      );
    });

    it("debe permitir consultar el health check mediante /api/health", async function () {
      const response = await request(app).get("/api/health");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.database).to.equal("connected");
    });
  });

  describe("Rutas inexistentes", function () {
    it("debe devolver 404 cuando la ruta no existe", async function () {
      const response = await request(app).get("/api/ruta-que-no-existe");

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("ROUTE_NOT_FOUND");
      expect(response.body.message).to.equal("Ruta no encontrada");
    });
  });
});

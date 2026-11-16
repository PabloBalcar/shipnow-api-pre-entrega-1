import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Aplicación", function () {
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

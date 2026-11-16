import { expect } from "chai";
import request from "supertest";
import app from "../../src/app.js";

describe("Logger", function () {
  describe("GET /api/logger/test", function () {
    it("debe ejecutar los seis niveles de Winston correctamente", async function () {
      const response = await request(app).get("/api/logger/test");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");

      expect(response.body).to.have.property(
        "message",
        "Prueba de los seis niveles de Winston ejecutada correctamente",
      );

      expect(response.body.levels).to.deep.equal([
        "debug",
        "http",
        "info",
        "warning",
        "error",
        "fatal",
      ]);
    });
  });
});

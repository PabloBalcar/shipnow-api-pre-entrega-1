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
});

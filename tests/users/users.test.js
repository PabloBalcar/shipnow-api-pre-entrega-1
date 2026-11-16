import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app.js";

describe("Usuarios", function () {
  describe("GET /api/users", function () {
    it("debe devolver HTTP 200 y una lista de usuarios", async function () {
      const response = await request(app).get("/api/users");

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "success");
      expect(response.body.payload).to.be.an("array");
    });
  });

  describe("GET /api/users/:uid", function () {
    it("debe devolver 404 si el usuario no existe", async function () {
      const nonexistentId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/users/${nonexistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("status", "error");
      expect(response.body).to.have.property("error", "USER_NOT_FOUND");
      expect(response.body).to.have.property(
        "message",
        "Usuario no encontrado",
      );
    });
  });
});

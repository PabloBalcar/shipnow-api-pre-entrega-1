import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { unlink } from "node:fs/promises";
import app from "../../src/app.js";
import UserModel from "../../src/models/user.model.js";

describe("Usuarios", function () {
  let testUser;
  let uploadedFilePath;

  before(async function () {
    testUser = await UserModel.create({
      firstName: "Usuario",
      lastName: "Testing",
      email: `testing-${new mongoose.Types.ObjectId()}@example.com`,
      password: "password123",
    });
  });

  after(async function () {
    if (uploadedFilePath) {
      await unlink(uploadedFilePath).catch(() => {});
    }

    if (testUser) {
      await UserModel.deleteOne({ _id: testUser._id });
    }
  });

  describe("GET /api/users", function () {
    it("debe devolver una lista de usuarios con metadatos de paginación", async function () {
      const response = await request(app).get("/api/users");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
      expect(response.body.pagination).to.be.an("object");
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(10);
      expect(response.body.pagination).to.have.property("total");
      expect(response.body.pagination).to.have.property("totalPages");

      response.body.payload.forEach((user) => {
        expect(user).to.not.have.property("password");
      });
    });

    it("debe respetar los parámetros page y limit", async function () {
      const response = await request(app).get("/api/users?page=1&limit=1");

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.be.an("array");
      expect(response.body.payload.length).to.be.at.most(1);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(1);
    });

    it("debe devolver 400 si page es inválido", async function () {
      const response = await request(app).get("/api/users?page=0");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("debe devolver 400 si limit supera el máximo permitido", async function () {
      const response = await request(app).get("/api/users?limit=101");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("VALIDATION_ERROR");
    });
  });

  describe("GET /api/users/:uid", function () {
    it("debe devolver 404 si el usuario no existe", async function () {
      const nonexistentId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/users/${nonexistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("USER_NOT_FOUND");
      expect(response.body.message).to.equal("Usuario no encontrado");
    });
  });

  describe("POST /api/users/:uid/documents", function () {
    it("debe cargar correctamente un documento del usuario", async function () {
      const response = await request(app)
        .post(`/api/users/${testUser._id}/documents`)
        .field("type", "driver_license")
        .attach("document", Buffer.from("%PDF-1.4 documento de prueba"), {
          filename: "licencia.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.documents).to.be.an("array");
      expect(response.body.payload.documents).to.have.lengthOf(1);

      const document = response.body.payload.documents[0];

      expect(document.originalName).to.equal("licencia.pdf");
      expect(document.mimeType).to.equal("application/pdf");
      expect(document.type).to.equal("driver_license");
      expect(document).to.have.property("fileName");
      expect(document).to.have.property("path");

      uploadedFilePath = document.path;
    });

    it("debe devolver 400 si no se adjunta un archivo", async function () {
      const response = await request(app)
        .post(`/api/users/${testUser._id}/documents`)
        .field("type", "driver_license");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("FILE_REQUIRED");
    });

    it("debe devolver 400 si el tipo de archivo no está permitido", async function () {
      const response = await request(app)
        .post(`/api/users/${testUser._id}/documents`)
        .field("type", "driver_license")
        .attach("document", Buffer.from("archivo de texto"), {
          filename: "documento.txt",
          contentType: "text/plain",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("INVALID_FILE_TYPE");
    });

    it("debe devolver 400 si el archivo supera los 5 MB", async function () {
      const largeFile = Buffer.alloc(5 * 1024 * 1024 + 1);

      const response = await request(app)
        .post(`/api/users/${testUser._id}/documents`)
        .field("type", "driver_license")
        .attach("document", largeFile, {
          filename: "documento-grande.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("FILE_TOO_LARGE");
    });

    it("debe devolver 400 si el tipo de documento no es válido", async function () {
      const response = await request(app)
        .post(`/api/users/${testUser._id}/documents`)
        .field("type", "tipo_invalido")
        .attach("document", Buffer.from("%PDF-1.4 documento de prueba"), {
          filename: "documento.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("INVALID_DOCUMENT_TYPE");
    });

    it("debe devolver 404 si el usuario no existe", async function () {
      const nonexistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/users/${nonexistentId}/documents`)
        .field("type", "driver_license")
        .attach("document", Buffer.from("%PDF-1.4 documento de prueba"), {
          filename: "licencia.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.error).to.equal("USER_NOT_FOUND");
    });
  });
});

import dotenv from "dotenv";
import mongoose from "mongoose";

// Cargar exclusivamente las variables del entorno de testing.
dotenv.config({
  path: ".env.test",
  override: true,
});

// Validar que nunca se utilice la base de desarrollo.
const mongoUri = process.env.MONGODB_URI;

if (process.env.NODE_ENV !== "test") {
  throw new Error("Los tests deben ejecutarse con NODE_ENV=test");
}

if (!mongoUri || new URL(mongoUri).pathname.slice(1) !== "shipnow-test") {
  throw new Error("La base de datos de testing debe ser shipnow-test");
}

// Importar la conexión después de validar el entorno.
const { default: connectDB } = await import("../src/config/db.js");

before(async function () {
  await connectDB();
});

after(async function () {
  await mongoose.connection.close();
});

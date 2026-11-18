import dotenv from "dotenv";
import { NODE_ENVIRONMENTS } from "../constants/index.js";

// Único lugar del proyecto que lee process.env.
dotenv.config();

const REQUIRED_ENV_VARS = ["PORT", "MONGODB_URI", "NODE_ENV"];

const missingVars = REQUIRED_ENV_VARS.filter(
  (name) => !process.env[name]?.trim(),
);

if (missingVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missingVars.join(", ")}. ` +
      "Revisá tu archivo .env (podés guiarte con .env.example).",
  );
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    `La variable PORT debe ser un entero entre 1 y 65535 (valor recibido: "${process.env.PORT}").`,
  );
}

const validEnvironments = Object.values(NODE_ENVIRONMENTS);

if (!validEnvironments.includes(process.env.NODE_ENV)) {
  throw new Error(
    `NODE_ENV inválido: "${process.env.NODE_ENV}". Valores permitidos: ${validEnvironments.join(", ")}.`,
  );
}

const mongoUri = process.env.MONGODB_URI.trim();

if (
  !mongoUri.startsWith("mongodb://") &&
  !mongoUri.startsWith("mongodb+srv://")
) {
  throw new Error("MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://.");
}

const validLogLevels = ["fatal", "error", "warning", "info", "http", "debug"];

const defaultLogLevel =
  process.env.NODE_ENV === NODE_ENVIRONMENTS.PRODUCTION ? "info" : "debug";

const logLevel = process.env.LOG_LEVEL?.trim() || defaultLogLevel;

if (!validLogLevels.includes(logLevel)) {
  throw new Error(
    `LOG_LEVEL inválido: "${logLevel}". Valores permitidos: ${validLogLevels.join(", ")}.`,
  );
}

// Orígenes CORS permitidos, separados por coma.
const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = Object.freeze({
  port,
  mongoUri,
  nodeEnv: process.env.NODE_ENV,
  logLevel,
  mongoDnsServer: process.env.MONGODB_DNS_SERVER?.trim() || null,
  corsOrigins,
});

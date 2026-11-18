import mongoose from "mongoose";
import express from "express";
import cors from "cors";

import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import productsRouter from "./routes/products.router.js";
import deliveriesRouter from "./routes/deliveries.router.js";
import mocksRouter from "./routes/mocks.router.js";
import loggerRouter from "./routes/logger.router.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/app-error.js";
import { ERRORS } from "./constants/errors.js";
import logger from "./config/logger.js";
import { config } from "./config/env.config.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./docs/swagger.config.js";

const app = express();

// Configuración CORS.
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite solicitudes sin Origin, como Postman y servicios internos.
      if (!origin) {
        return callback(null, true);
      }

      // En desarrollo, si no hay orígenes configurados, permite todos.
      if (config.nodeEnv !== "production" && config.corsOrigins.length === 0) {
        return callback(null, true);
      }

      // En producción solamente permite los orígenes autorizados.
      return callback(null, config.corsOrigins.includes(origin));
    },
  }),
);

// Limitar el tamaño de los cuerpos JSON.
app.use(express.json({ limit: "1mb" }));

// Endpoint de logs disponible solamente fuera de producción.
if (config.nodeEnv !== "production") {
  app.use("/api/logger", loggerRouter);
}

// Registrar las peticiones HTTP.
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    logger.http("Solicitud HTTP", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  next();
});

// Exponer la especificación OpenAPI en formato JSON.
// Se registra antes de Swagger UI para evitar conflictos de rutas.
app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpecs);
});

// Documentación interactiva de la API.
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Ruta principal.
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API",
  });
});

// Verificar el estado de la conexión con MongoDB.
const healthCheck = (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "success" : "error",
    environment: config.nodeEnv,
    database: databaseConnected ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

// Endpoints de salud.
app.get("/health", healthCheck);
app.get("/api/health", healthCheck);

// Rutas principales de la API.
app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/deliveries", deliveriesRouter);

// Mocks disponibles solamente fuera de producción.
if (config.nodeEnv !== "production") {
  app.use("/api/mocks", mocksRouter);
}

// Manejar rutas inexistentes.
app.use((req, res, next) => {
  next(new AppError(ERRORS.ROUTE_NOT_FOUND));
});

// Middleware global de errores (siempre al final).
app.use(errorHandler);

export default app;

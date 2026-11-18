import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import productsRouter from "./routes/products.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/app-error.js";
import { ERRORS } from "./constants/errors.js";
import logger from "./config/logger.js";
import loggerRouter from "./routes/logger.router.js";
import { config } from "./config/env.config.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./docs/swagger.config.js";

const app = express();

app.use(cors());
app.use(express.json());

if (config.nodeEnv !== "production") {
  app.use("/api/logger", loggerRouter);
}

// Middleware para registrar las peticiones HTTP.
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

// Documentación interactiva de la API.
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API",
  });
});

app.get("/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "success" : "error",
    environment: config.nodeEnv,
    database: databaseConnected ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
if (config.nodeEnv !== "production") {
  app.use("/api/mocks", mocksRouter);
}
// Las rutas inexistentes también pasan por el middleware global.
app.use((req, res, next) => {
  next(new AppError(ERRORS.ROUTE_NOT_FOUND));
});

// El middleware de errores siempre debe quedar al final.
app.use(errorHandler);

export default app;

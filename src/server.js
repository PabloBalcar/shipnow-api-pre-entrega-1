import { createServer } from "node:http";
import mongoose from "mongoose";
import { config } from "./config/env.config.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";

const server = createServer(app);

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.info("Iniciando cierre ordenado del servidor", {
    signal,
  });

  server.close(async (error) => {
    try {
      if (error) {
        logger.error("Error al cerrar el servidor HTTP", {
          message: error.message,
        });
      }

      await mongoose.disconnect();

      logger.info("Conexión con MongoDB cerrada correctamente");
      logger.info("Servidor detenido correctamente");

      process.exit(error ? 1 : 0);
    } catch (disconnectError) {
      logger.error("Error al cerrar la conexión con MongoDB", {
        message: disconnectError.message,
      });

      process.exit(1);
    }
  });
};

const startServer = async () => {
  try {
    await connectDB();

    server.listen(config.port, () => {
      logger.info(`Servidor escuchando en el puerto ${config.port}`, {
        environment: config.nodeEnv,
      });
    });

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.fatal("Error crítico al iniciar el servidor", {
      message: error.message,
      stack: error.stack,
    });

    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

startServer();

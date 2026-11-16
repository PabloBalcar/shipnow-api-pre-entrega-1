import { config } from "./config/env.config.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      logger.info(`Servidor escuchando en el puerto ${config.port}`, {
        environment: config.nodeEnv,
      });
    });
  } catch (error) {
    logger.fatal("Error crítico al iniciar el servidor", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();

import mongoose from "mongoose";
import dns from "node:dns";
import { config } from "./env.config.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    // Permite configurar un DNS alternativo cuando sea necesario.
    // Si no se define, se utiliza el DNS del sistema.
    if (config.mongoDnsServer) {
      dns.setServers([config.mongoDnsServer]);
    }

    await mongoose.connect(config.mongoUri);

    logger.info("MongoDB conectado correctamente");
  } catch (error) {
    logger.fatal("Error al conectar con MongoDB", {
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

export default connectDB;

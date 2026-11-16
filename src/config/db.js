import mongoose from "mongoose";
import dns from "node:dns";
import { config } from "./env.config.js";
import logger from "./logger.js";

dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
  try {
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

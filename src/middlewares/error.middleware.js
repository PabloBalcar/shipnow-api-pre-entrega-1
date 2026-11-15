import { config } from "../config/env.config.js";
import { NODE_ENVIRONMENTS } from "../constants/index.js";

// Traduce cualquier error a la respuesta { status: "error", message }.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message;

  if (error.name === "ValidationError" || error.name === "CastError") {
    statusCode = 400;
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Ya existe un registro con ese valor único";
  }

  if (statusCode >= 500) {
    console.error(error);
    if (config.nodeEnv === NODE_ENVIRONMENTS.PRODUCTION) {
      message = "Error interno del servidor";
    }
  }

  res.status(statusCode).json({ status: "error", message });
};

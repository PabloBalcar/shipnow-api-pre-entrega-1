import { config } from "../config/env.config.js";
import { NODE_ENVIRONMENTS } from "../constants/index.js";
import { ERRORS } from "../constants/errors.js";
import { AppError } from "../utils/app-error.js";
import logger from "../config/logger.js";

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let errorData = ERRORS.INTERNAL_SERVER_ERROR;
  let details = null;

  // Errores personalizados de la aplicación.
  if (error instanceof AppError) {
    errorData = {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
    details = error.details;
  }

  // Errores generados por Multer.
  else if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      errorData = ERRORS.FILE_TOO_LARGE;
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      errorData = ERRORS.INVALID_UPLOAD_FIELD;
    } else {
      errorData = ERRORS.UPLOAD_ERROR;
    }
  }

  // Errores de validación de Mongoose.
  else if (error.name === "ValidationError") {
    errorData = ERRORS.VALIDATION_ERROR;

    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  // Identificadores de MongoDB con formato inválido.
  else if (error.name === "CastError") {
    errorData = ERRORS.INVALID_ID;
  }

  // Registros duplicados en campos únicos.
  else if (error.code === 11000) {
    errorData = ERRORS.DUPLICATE_RESOURCE;
  }

  // Problemas de conexión o comunicación con MongoDB.
  else if (/^(Mongo|Mongoose)/.test(error.name ?? "")) {
    errorData = ERRORS.DATABASE_ERROR;
  }

  // Registro de errores mediante Winston.
  if (errorData.statusCode >= 500) {
    logger.error("Error inesperado en la aplicación", {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
    });
  } else {
    logger.warning("Error controlado en la aplicación", {
      code: errorData.code,
      message: errorData.message,
      method: req.method,
      url: req.originalUrl,
    });
  }

  // En producción no se exponen detalles internos.
  if (
    config.nodeEnv === NODE_ENVIRONMENTS.PRODUCTION &&
    errorData.statusCode >= 500
  ) {
    errorData = ERRORS.INTERNAL_SERVER_ERROR;
    details = null;
  }

  const response = {
    status: "error",
    statusCode: errorData.statusCode,
    error: errorData.code,
    message: errorData.message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(errorData.statusCode).json(response);
};

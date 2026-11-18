import { AppError } from "./app-error.js";
import { ERRORS } from "../constants/errors.js";

export const validateAllowedFields = (data, allowedFields) => {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError(ERRORS.VALIDATION_ERROR);
  }

  const invalidFields = Object.keys(data).filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    throw new AppError({
      ...ERRORS.VALIDATION_ERROR,
      details: invalidFields.map((field) => ({
        field,
        message: "Este campo no está permitido",
      })),
    });
  }
};

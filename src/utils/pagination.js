import { AppError } from "./app-error.js";
import { ERRORS } from "../constants/errors.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Valida y calcula los parámetros de paginación.
export const getPaginationParams = (query = {}) => {
  const page = Number(query.page ?? DEFAULT_PAGE);
  const limit = Number(query.limit ?? DEFAULT_LIMIT);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError({
      ...ERRORS.VALIDATION_ERROR,
      message: "El parámetro page debe ser un entero mayor o igual a 1",
      details: { parameter: "page", value: query.page },
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new AppError({
      ...ERRORS.VALIDATION_ERROR,
      message: `El parámetro limit debe ser un entero entre 1 y ${MAX_LIMIT}`,
      details: { parameter: "limit", value: query.limit },
    });
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// Construye los metadatos de paginación.
export const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

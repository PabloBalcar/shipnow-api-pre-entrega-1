// Diccionario centralizado de errores de ShipNow.
// Cada error define un código interno, un mensaje y un estado HTTP.

export const ERRORS = Object.freeze({
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "Usuario no encontrado",
    statusCode: 404,
  },
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "El email ya está registrado",
    statusCode: 409,
  },
  STORE_NOT_FOUND: {
    code: "STORE_NOT_FOUND",
    message: "Comercio no encontrado",
    statusCode: 404,
  },
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    message: "Producto no encontrado",
    statusCode: 404,
  },
  ORDER_NOT_FOUND: {
    code: "ORDER_NOT_FOUND",
    message: "Pedido no encontrado",
    statusCode: 404,
  },
  ORDER_REQUIRED_FIELDS: {
    code: "ORDER_REQUIRED_FIELDS",
    message: "Faltan datos obligatorios para crear el pedido",
    statusCode: 400,
  },
  ORDER_ITEMS_REQUIRED: {
    code: "ORDER_ITEMS_REQUIRED",
    message: "El pedido debe tener al menos un producto",
    statusCode: 400,
  },
  INVALID_ORDER_STATUS: {
    code: "INVALID_ORDER_STATUS",
    message: "El estado del pedido no es válido",
    statusCode: 400,
  },
  PRODUCT_REQUIRED_FIELDS: {
    code: "PRODUCT_REQUIRED_FIELDS",
    message: "Faltan datos obligatorios (name, price, store)",
    statusCode: 400,
  },
  INVALID_PRODUCT_STOCK: {
    code: "INVALID_PRODUCT_STOCK",
    message: "El stock debe ser un número entero mayor o igual a 0",
    statusCode: 400,
  },
  INVALID_MOCK_AMOUNT: {
    code: "INVALID_MOCK_AMOUNT",
    message: "La cantidad debe ser un número entero entre 1 y 100",
    statusCode: 400,
  },
  MOCK_GENERATION_ERROR: {
    code: "MOCK_GENERATION_ERROR",
    message: "No se pudieron generar los datos de prueba",
    statusCode: 500,
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Ocurrió un error al interactuar con la base de datos",
    statusCode: 500,
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Los datos enviados no son válidos",
    statusCode: 400,
  },
  DUPLICATE_RESOURCE: {
    code: "DUPLICATE_RESOURCE",
    message: "Ya existe un registro con ese valor único",
    statusCode: 409,
  },
  INVALID_ID: {
    code: "INVALID_ID",
    message: "El identificador proporcionado no es válido",
    statusCode: 400,
  },
  ROUTE_NOT_FOUND: {
    code: "ROUTE_NOT_FOUND",
    message: "Ruta no encontrada",
    statusCode: 404,
  },
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    message: "Error interno del servidor",
    statusCode: 500,
  },
});

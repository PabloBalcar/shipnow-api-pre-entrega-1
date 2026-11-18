// Diccionario centralizado de errores de ShipNow.
// Cada error define un código interno, un mensaje y un estado HTTP.

export const ERRORS = Object.freeze({
  // Usuarios
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

  // Comercios
  STORE_NOT_FOUND: {
    code: "STORE_NOT_FOUND",
    message: "Comercio no encontrado",
    statusCode: 404,
  },

  // Productos
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    message: "Producto no encontrado",
    statusCode: 404,
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

  // Pedidos
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

  // Entregas
  DELIVERY_NOT_FOUND: {
    code: "DELIVERY_NOT_FOUND",
    message: "Entrega no encontrada",
    statusCode: 404,
  },
  DELIVERY_ALREADY_EXISTS: {
    code: "DELIVERY_ALREADY_EXISTS",
    message: "El pedido ya tiene una entrega asociada",
    statusCode: 409,
  },
  INVALID_COURIER: {
    code: "INVALID_COURIER",
    message: "El usuario indicado no es un repartidor válido",
    statusCode: 400,
  },
  INVALID_DELIVERY_STATUS: {
    code: "INVALID_DELIVERY_STATUS",
    message: "El estado de la entrega no es válido",
    statusCode: 400,
  },
  INVALID_DELIVERY_TRANSITION: {
    code: "INVALID_DELIVERY_TRANSITION",
    message: "No se permite realizar esa transición de estado",
    statusCode: 400,
  },
  DELIVERY_ORDER_NOT_AVAILABLE: {
    code: "DELIVERY_ORDER_NOT_AVAILABLE",
    message: "El pedido no está disponible para crear una entrega",
    statusCode: 400,
  },
  DELIVERY_COURIER_REQUIRED: {
    code: "DELIVERY_COURIER_REQUIRED",
    message: "Es necesario asignar un repartidor antes de continuar",
    statusCode: 400,
  },

  // Mocks
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

  // Base de datos
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Ocurrió un error al interactuar con la base de datos",
    statusCode: 500,
  },

  // Validaciones generales
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

  // Archivos
  FILE_REQUIRED: {
    code: "FILE_REQUIRED",
    message: "Es obligatorio adjuntar un archivo",
    statusCode: 400,
  },
  INVALID_FILE_TYPE: {
    code: "INVALID_FILE_TYPE",
    message: "El tipo de archivo no está permitido",
    statusCode: 400,
  },
  INVALID_FILE_CONTENT: {
    code: "INVALID_FILE_CONTENT",
    message: "El contenido del archivo no coincide con el tipo declarado",
    statusCode: 400,
  },
  FILE_TOO_LARGE: {
    code: "FILE_TOO_LARGE",
    message: "El archivo supera el tamaño máximo permitido de 5 MB",
    statusCode: 400,
  },
  INVALID_UPLOAD_FIELD: {
    code: "INVALID_UPLOAD_FIELD",
    message: "El campo de archivo enviado no es válido",
    statusCode: 400,
  },
  INVALID_DOCUMENT_TYPE: {
    code: "INVALID_DOCUMENT_TYPE",
    message: "El tipo de documento no es válido",
    statusCode: 400,
  },
  UPLOAD_ERROR: {
    code: "UPLOAD_ERROR",
    message: "No se pudo procesar el archivo",
    statusCode: 500,
  },

  // Errores internos
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    message: "Error interno del servidor",
    statusCode: 500,
  },
  INVALID_ORDER_ITEMS: {
    code: "INVALID_ORDER_ITEMS",
    message:
      "Cada producto debe tener un nombre válido, una cantidad entera mayor o igual a 1 y un precio válido mayor o igual a 0",
    statusCode: 400,
  },
  INVALID_ORDER_PRIORITY: {
    code: "INVALID_ORDER_PRIORITY",
    message: "La prioridad del pedido no es válida",
    statusCode: 400,
  },
});

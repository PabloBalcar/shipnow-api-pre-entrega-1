// Constantes del dominio de ShipNow.
// Object.freeze evita que alguien las modifique por accidente en tiempo de ejecución.

export const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
  COURIER: "COURIER",
});

export const ORDER_STATUS = Object.freeze({
  CREATED: "created",
  ASSIGNED: "assigned",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

export const DELIVERY_PRIORITY = Object.freeze({
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
});
export const DELIVERY_STATUS = Object.freeze({
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: "available",
  OUT_OF_STOCK: "out_of_stock",
});

export const NODE_ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production",
});

export const DOCUMENT_TYPES = Object.freeze({
  USER_DOCUMENT: "user_document",
  DRIVER_LICENSE: "driver_license",
  ADMINISTRATIVE_DOCUMENT: "administrative_document",
  DELIVERY_PROOF: "delivery_proof",
});

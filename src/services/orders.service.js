import { unlink } from "node:fs/promises";
import { ordersRepository } from "../repositories/orders.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import {
  ORDER_STATUS,
  DELIVERY_PRIORITY,
  DOCUMENT_TYPES,
} from "../constants/index.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";
import logger from "../config/logger.js";
import { getPaginationParams, buildPagination } from "../utils/pagination.js";

const notFound = (id) => {
  logger.warning("Pedido no encontrado", { orderId: id });
  return new AppError(ERRORS.ORDER_NOT_FOUND);
};

const validateOrderItems = (items) => {
  const validItems =
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (item) =>
        item &&
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0,
    );

  if (!validItems) {
    throw new AppError(ERRORS.INVALID_ORDER_ITEMS);
  }
};

export const ordersService = {
  // Regla de negocio pura: calcula el total a partir de los ítems validados.
  calculateTotal: (items) =>
    items.reduce(
      (accumulator, item) => accumulator + item.price * item.quantity,
      0,
    ),

  getAll: async (query = {}) => {
    const pagination = getPaginationParams(query);

    const [orders, total] = await Promise.all([
      ordersRepository.findAll(pagination),
      ordersRepository.countAll(),
    ]);

    return {
      payload: orders,
      pagination: buildPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  },

  getById: async (id) => {
    const order = await ordersRepository.findById(id);
    if (!order) throw notFound(id);
    return order;
  },

  create: async (orderData) => {
    const { customer, store, items, deliveryAddress, priority } = orderData;

    if (!customer || !store || !Array.isArray(items) || !deliveryAddress) {
      throw new AppError(ERRORS.ORDER_REQUIRED_FIELDS);
    }

    if (items.length === 0) {
      throw new AppError(ERRORS.ORDER_ITEMS_REQUIRED);
    }

    validateOrderItems(items);

    if (
      priority !== undefined &&
      !Object.values(DELIVERY_PRIORITY).includes(priority)
    ) {
      throw new AppError(ERRORS.INVALID_ORDER_PRIORITY);
    }

    if (
      typeof deliveryAddress !== "string" ||
      deliveryAddress.trim().length === 0
    ) {
      throw new AppError(ERRORS.ORDER_REQUIRED_FIELDS);
    }

    if (!(await usersRepository.exists(customer))) {
      throw new AppError(ERRORS.USER_NOT_FOUND);
    }

    if (!(await storesRepository.exists(store))) {
      throw new AppError(ERRORS.STORE_NOT_FOUND);
    }

    const order = await ordersRepository.create({
      customer,
      store,
      items: items.map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryAddress: deliveryAddress.trim(),
      priority: priority ?? DELIVERY_PRIORITY.NORMAL,
      total: ordersService.calculateTotal(items),
      status: ORDER_STATUS.CREATED,
    });

    logger.info("Pedido creado correctamente", {
      orderId: order._id.toString(),
    });

    return order;
  },

  updateStatus: async (id, status) => {
    const validStatuses = Object.values(ORDER_STATUS);

    if (!validStatuses.includes(status)) {
      throw new AppError({
        ...ERRORS.INVALID_ORDER_STATUS,
        details: { validStatuses },
      });
    }

    const order = await ordersRepository.updateStatus(id, status);
    if (!order) throw notFound(id);
    return order;
  },

  delete: async (id) => {
    const order = await ordersRepository.deleteById(id);
    if (!order) throw notFound(id);
    return order;
  },

  // Asocia un comprobante al pedido y guarda sus metadatos.
  addProof: async (id, file) => {
    if (!file) {
      throw new AppError(ERRORS.FILE_REQUIRED);
    }

    try {
      const existingOrder = await ordersRepository.findById(id);

      if (!existingOrder) {
        throw notFound(id);
      }

      const proof = {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        type: DOCUMENT_TYPES.DELIVERY_PROOF,
        uploadedAt: new Date(),
      };

      const updatedOrder = await ordersRepository.addProof(id, proof);

      if (!updatedOrder) {
        throw notFound(id);
      }

      logger.info("Comprobante asociado al pedido correctamente", {
        orderId: id,
        fileName: file.filename,
      });

      return updatedOrder;
    } catch (error) {
      await unlink(file.path).catch(() => {});
      throw error;
    }
  },
};

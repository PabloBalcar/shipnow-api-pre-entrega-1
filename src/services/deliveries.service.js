import mongoose from "mongoose";
import { deliveriesRepository } from "../repositories/deliveries.repository.js";
import { ordersRepository } from "../repositories/orders.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import {
  DELIVERY_STATUS,
  ORDER_STATUS,
  USER_ROLES,
  DOCUMENT_TYPES,
} from "../constants/index.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";
import logger from "../config/logger.js";
import { getPaginationParams, buildPagination } from "../utils/pagination.js";
import { unlink } from "node:fs/promises";

const validTransitions = {
  [DELIVERY_STATUS.ASSIGNED]: [
    DELIVERY_STATUS.PICKED_UP,
    DELIVERY_STATUS.CANCELLED,
  ],
  [DELIVERY_STATUS.PICKED_UP]: [DELIVERY_STATUS.IN_TRANSIT],
  [DELIVERY_STATUS.IN_TRANSIT]: [DELIVERY_STATUS.DELIVERED],
};

const orderStatusByDelivery = {
  [DELIVERY_STATUS.ASSIGNED]: ORDER_STATUS.ASSIGNED,
  [DELIVERY_STATUS.PICKED_UP]: ORDER_STATUS.PICKED_UP,
  [DELIVERY_STATUS.IN_TRANSIT]: ORDER_STATUS.IN_TRANSIT,
  [DELIVERY_STATUS.DELIVERED]: ORDER_STATUS.DELIVERED,
  [DELIVERY_STATUS.CANCELLED]: ORDER_STATUS.CANCELLED,
};

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(ERRORS.INVALID_ID);
  }
};

const validateNote = (note) => {
  if (typeof note !== "string" || note.length > 500) {
    throw new AppError({
      ...ERRORS.VALIDATION_ERROR,
      message: "La nota debe ser un texto de hasta 500 caracteres",
    });
  }
};

const getDeliveryOrFail = async (id) => {
  const delivery = await deliveriesRepository.findById(id);

  if (!delivery) {
    logger.warning("Entrega no encontrada", { deliveryId: id });
    throw new AppError(ERRORS.DELIVERY_NOT_FOUND);
  }

  return delivery;
};

// Si falla la sincronización del pedido, se intenta revertir
// la modificación que se había realizado en la entrega.
const restoreDelivery = async (
  id,
  currentStatus,
  previousData,
  originalError,
) => {
  try {
    const restored = await deliveriesRepository.restoreAfterFailedSync(
      id,
      currentStatus,
      previousData,
    );

    if (!restored) {
      throw new Error("No se pudo restaurar el estado anterior de la entrega");
    }
  } catch (rollbackError) {
    logger.error("Falló la reversión de una entrega", {
      deliveryId: id,
      rollbackError: rollbackError.message,
      originalError: originalError.message,
    });

    const databaseError = new AppError(ERRORS.DATABASE_ERROR);
    databaseError.cause = rollbackError;
    throw databaseError;
  }
};

export const deliveriesService = {
  getAll: async (query = {}) => {
    const pagination = getPaginationParams(query);

    const [deliveries, total] = await Promise.all([
      deliveriesRepository.findAll(pagination),
      deliveriesRepository.countAll(),
    ]);

    return {
      payload: deliveries,
      pagination: buildPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  },

  getById: async (id) => {
    validateId(id);
    return getDeliveryOrFail(id);
  },

  create: async ({ order, note = "" } = {}) => {
    if (!order) {
      throw new AppError({
        ...ERRORS.VALIDATION_ERROR,
        message: "Es obligatorio indicar el pedido para crear la entrega",
      });
    }

    validateId(order);
    validateNote(note);

    const existingOrder = await ordersRepository.findById(order);

    if (!existingOrder) {
      throw new AppError(ERRORS.ORDER_NOT_FOUND);
    }

    if (existingOrder.status !== ORDER_STATUS.CREATED) {
      throw new AppError(ERRORS.DELIVERY_ORDER_NOT_AVAILABLE);
    }

    const existingDelivery = await deliveriesRepository.findByOrder(order);

    if (existingDelivery) {
      throw new AppError(ERRORS.DELIVERY_ALREADY_EXISTS);
    }

    try {
      const delivery = await deliveriesRepository.create({
        order,
        status: DELIVERY_STATUS.PENDING,
        history: [
          {
            status: DELIVERY_STATUS.PENDING,
            note,
            changedAt: new Date(),
          },
        ],
      });

      logger.info("Entrega creada correctamente", {
        deliveryId: delivery._id.toString(),
        orderId: order,
      });

      return deliveriesRepository.findById(delivery._id);
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError(ERRORS.DELIVERY_ALREADY_EXISTS);
      }

      throw error;
    }
  },

  assignCourier: async (id, { courier, note = "" } = {}) => {
    validateId(id);
    validateNote(note);

    if (!courier) {
      throw new AppError(ERRORS.INVALID_COURIER);
    }

    validateId(courier);

    const delivery = await getDeliveryOrFail(id);

    if (delivery.status !== DELIVERY_STATUS.PENDING) {
      throw new AppError(ERRORS.INVALID_DELIVERY_TRANSITION);
    }

    const courierUser = await usersRepository.findById(courier);

    if (!courierUser || courierUser.role !== USER_ROLES.COURIER) {
      throw new AppError(ERRORS.INVALID_COURIER);
    }

    const updatedDelivery = await deliveriesRepository.updateIfStatus(
      id,
      DELIVERY_STATUS.PENDING,
      {
        $set: {
          courier,
          status: DELIVERY_STATUS.ASSIGNED,
        },
        $push: {
          history: {
            status: DELIVERY_STATUS.ASSIGNED,
            note,
            changedAt: new Date(),
          },
        },
      },
    );

    if (!updatedDelivery) {
      throw new AppError(ERRORS.INVALID_DELIVERY_TRANSITION);
    }

    try {
      const updatedOrder = await ordersRepository.updateStatus(
        delivery.order._id ?? delivery.order,
        ORDER_STATUS.ASSIGNED,
      );

      if (!updatedOrder) {
        throw new AppError(ERRORS.ORDER_NOT_FOUND);
      }
    } catch (error) {
      await restoreDelivery(
        id,
        DELIVERY_STATUS.ASSIGNED,
        {
          status: DELIVERY_STATUS.PENDING,
          courier: null,
          deliveredAt: delivery.deliveredAt,
        },
        error,
      );

      throw error;
    }

    logger.info("Repartidor asignado a la entrega", {
      deliveryId: id,
      courierId: courier,
    });

    return deliveriesRepository.findById(id);
  },

  updateStatus: async (id, { status, note = "" } = {}) => {
    validateId(id);
    validateNote(note);

    const validStatuses = Object.values(DELIVERY_STATUS);

    if (!validStatuses.includes(status)) {
      throw new AppError({
        ...ERRORS.INVALID_DELIVERY_STATUS,
        details: { validStatuses },
      });
    }

    const delivery = await getDeliveryOrFail(id);

    if (!validTransitions[delivery.status]?.includes(status)) {
      throw new AppError(ERRORS.INVALID_DELIVERY_TRANSITION);
    }

    if (status !== DELIVERY_STATUS.CANCELLED && !delivery.courier) {
      throw new AppError(ERRORS.DELIVERY_COURIER_REQUIRED);
    }

    const previousStatus = delivery.status;
    const nextDeliveredAt =
      status === DELIVERY_STATUS.DELIVERED ? new Date() : delivery.deliveredAt;

    const updatedDelivery = await deliveriesRepository.updateIfStatus(
      id,
      previousStatus,
      {
        $set: {
          status,
          deliveredAt: nextDeliveredAt,
        },
        $push: {
          history: {
            status,
            note,
            changedAt: new Date(),
          },
        },
      },
    );

    if (!updatedDelivery) {
      throw new AppError(ERRORS.INVALID_DELIVERY_TRANSITION);
    }

    const orderId = delivery.order._id ?? delivery.order;
    const orderStatus = orderStatusByDelivery[status];

    try {
      const updatedOrder = await ordersRepository.updateStatus(
        orderId,
        orderStatus,
      );

      if (!updatedOrder) {
        throw new AppError(ERRORS.ORDER_NOT_FOUND);
      }
    } catch (error) {
      await restoreDelivery(
        id,
        status,
        {
          status: previousStatus,
          courier: delivery.courier?._id ?? delivery.courier ?? null,
          deliveredAt: delivery.deliveredAt,
        },
        error,
      );

      throw error;
    }

    logger.info("Estado de entrega actualizado", {
      deliveryId: id,
      previousStatus,
      newStatus: status,
    });

    return deliveriesRepository.findById(id);
  },

  getTracking: async (id) => {
    const delivery = await deliveriesService.getById(id);

    return {
      deliveryId: delivery._id,
      status: delivery.status,
      deliveredAt: delivery.deliveredAt,
      order: delivery.order,
      courier: delivery.courier,
      history: delivery.history,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  },

  addProof: async (id, file) => {
    if (!file) {
      throw new AppError(ERRORS.FILE_REQUIRED);
    }

    try {
      validateId(id);
      await getDeliveryOrFail(id);

      const proof = {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        type: DOCUMENT_TYPES.DELIVERY_PROOF,
        uploadedAt: new Date(),
      };

      const updatedDelivery = await deliveriesRepository.addProof(id, proof);

      if (!updatedDelivery) {
        throw new AppError(ERRORS.DELIVERY_NOT_FOUND);
      }

      logger.info("Comprobante asociado a la entrega correctamente", {
        deliveryId: id,
        fileName: file.filename,
      });

      return updatedDelivery;
    } catch (error) {
      await unlink(file.path).catch(() => {});
      throw error;
    }
  },
};

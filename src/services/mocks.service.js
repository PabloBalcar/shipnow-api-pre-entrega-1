import { mocksRepository } from "../repositories/mocks.repository.js";
import {
  generateMockUser,
  generateMockStore,
  generateMockOrder,
  generateMockDelivery,
} from "../utils/mock-generator.js";
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
} from "../constants/index.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";
import logger from "../config/logger.js";

const validateQuantity = (qty) => {
  const quantity = Number(qty);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    logger.warning("Cantidad inválida solicitada para generar mocks", {
      quantity: qty,
      allowedRange: "1-100",
    });

    throw new AppError(ERRORS.INVALID_MOCK_AMOUNT);
  }

  return quantity;
};

const removePasswords = (users) => users.map(({ password, ...user }) => user);

const generateRelatedMocks = (qty) => {
  const quantity = validateQuantity(qty);

  const users = Array.from({ length: quantity }, () =>
    generateMockUser(USER_ROLES.USER),
  );

  const couriers = Array.from({ length: quantity }, () =>
    generateMockUser(USER_ROLES.COURIER),
  );

  const stores = users.map((user) => generateMockStore({ owner: user._id }));

  const orders = users.map((user, index) =>
    generateMockOrder({
      customer: user._id,
      store: stores[index]._id,
      status: ORDER_STATUS.ASSIGNED,
    }),
  );

  const deliveries = orders.map((order, index) =>
    generateMockDelivery({
      order: order._id,
      courier: couriers[index]._id,
      status: DELIVERY_STATUS.ASSIGNED,
    }),
  );

  logger.info("Mocks relacionados generados correctamente", {
    quantity,
    collections: ["users", "couriers", "stores", "orders", "deliveries"],
  });

  return { users, couriers, stores, orders, deliveries };
};

export const mocksService = {
  generateUsers: (qty) => {
    const quantity = validateQuantity(qty);

    const users = removePasswords(
      Array.from({ length: quantity }, () => generateMockUser()),
    );

    logger.info("Usuarios mock generados", { quantity });

    return users;
  },

  generateCouriers: (qty) => {
    const quantity = validateQuantity(qty);

    const couriers = removePasswords(
      Array.from({ length: quantity }, () =>
        generateMockUser(USER_ROLES.COURIER),
      ),
    );

    logger.info("Repartidores mock generados", { quantity });

    return couriers;
  },

  generateOrders: (qty) => {
    const { orders } = generateRelatedMocks(qty);
    return orders;
  },

  generateDeliveries: (qty) => {
    const { deliveries } = generateRelatedMocks(qty);
    return deliveries;
  },

  seed: async (qty) => {
    const { users, couriers, stores, orders, deliveries } =
      generateRelatedMocks(qty);

    try {
      const insertedUsers = await mocksRepository.insertUsers(users);
      const insertedCouriers = await mocksRepository.insertUsers(couriers);
      const insertedStores = await mocksRepository.insertStores(stores);
      const insertedOrders = await mocksRepository.insertOrders(orders);
      const insertedDeliveries =
        await mocksRepository.insertDeliveries(deliveries);

      const result = {
        insertados: {
          usuarios: insertedUsers.length,
          repartidores: insertedCouriers.length,
          comercios: insertedStores.length,
          pedidos: insertedOrders.length,
          entregas: insertedDeliveries.length,
        },
      };

      logger.info("Carga de mocks en base de datos completada", {
        inserted: result.insertados,
      });

      return result;
    } catch (error) {
      // Conservamos los errores que el middleware ya sabe interpretar.
      if (
        error instanceof AppError ||
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        error.code === 11000
      ) {
        throw error;
      }

      // Identificamos específicamente los problemas de MongoDB/Mongoose.
      if (/^(Mongo|Mongoose)/.test(error.name ?? "")) {
        const appError = new AppError(ERRORS.DATABASE_ERROR);
        appError.cause = error;
        throw appError;
      }

      // Cualquier otro fallo durante la carga se informa de forma controlada.
      const appError = new AppError(ERRORS.MOCK_GENERATION_ERROR);
      appError.cause = error;
      throw appError;
    }
  },
};

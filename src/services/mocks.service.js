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

const validateQuantity = (qty) => {
  const quantity = Number(qty);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new AppError(
      "La cantidad debe ser un número entero entre 1 y 100",
      400,
    );
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

  return { users, couriers, stores, orders, deliveries };
};

export const mocksService = {
  generateUsers: (qty) => {
    const quantity = validateQuantity(qty);

    return removePasswords(
      Array.from({ length: quantity }, () => generateMockUser()),
    );
  },

  generateCouriers: (qty) => {
    const quantity = validateQuantity(qty);

    return removePasswords(
      Array.from({ length: quantity }, () =>
        generateMockUser(USER_ROLES.COURIER),
      ),
    );
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

    const insertedUsers = await mocksRepository.insertUsers(users);
    const insertedCouriers = await mocksRepository.insertUsers(couriers);
    const insertedStores = await mocksRepository.insertStores(stores);
    const insertedOrders = await mocksRepository.insertOrders(orders);
    const insertedDeliveries =
      await mocksRepository.insertDeliveries(deliveries);

    return {
      insertados: {
        usuarios: insertedUsers.length,
        repartidores: insertedCouriers.length,
        comercios: insertedStores.length,
        pedidos: insertedOrders.length,
        entregas: insertedDeliveries.length,
      },
    };
  },
};

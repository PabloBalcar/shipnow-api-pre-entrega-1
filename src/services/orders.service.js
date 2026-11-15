import { ordersRepository } from "../repositories/orders.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { ORDER_STATUS, DELIVERY_PRIORITY } from "../constants/index.js";
import { AppError } from "../utils/app-error.js";

const notFound = () => new AppError("Pedido no encontrado", 404);

export const ordersService = {
  // Regla de negocio pura (sin base de datos): fácil de testear
  calculateTotal: (items) =>
    items.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0),

  getAll: () => ordersRepository.findAll(),

  getById: async (id) => {
    const order = await ordersRepository.findById(id);
    if (!order) throw notFound();
    return order;
  },

  create: async (orderData) => {
    const { customer, store, items, deliveryAddress, priority } = orderData;

    if (!customer || !store || !items || !deliveryAddress) {
      throw new AppError("Faltan datos obligatorios", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("El pedido debe tener al menos un producto", 400);
    }

    if (!(await usersRepository.exists(customer))) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (!(await storesRepository.exists(store))) {
      throw new AppError("Comercio no encontrado", 404);
    }

    return ordersRepository.create({
      customer,
      store,
      items,
      deliveryAddress,
      priority: priority ?? DELIVERY_PRIORITY.NORMAL,
      total: ordersService.calculateTotal(items),
      status: ORDER_STATUS.CREATED
    });
  },

  updateStatus: async (id, status) => {
    const validStatuses = Object.values(ORDER_STATUS);

    if (!validStatuses.includes(status)) {
      throw new AppError(`Estado inválido. Valores permitidos: ${validStatuses.join(", ")}`, 400);
    }

    const order = await ordersRepository.updateStatus(id, status);
    if (!order) throw notFound();
    return order;
  },

  delete: async (id) => {
    const order = await ordersRepository.deleteById(id);
    if (!order) throw notFound();
    return order;
  }
};

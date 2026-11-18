import UserModel from "../models/user.model.js";
import StoreModel from "../models/store.model.js";
import OrderModel from "../models/order.model.js";
import DeliveryModel from "../models/delivery.model.js";
import { hashPassword, isHashedPassword } from "../utils/password.js";

export const mocksRepository = {
  insertUsers: async (users) => {
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: isHashedPassword(user.password)
          ? user.password
          : await hashPassword(user.password),
      })),
    );

    return UserModel.insertMany(usersWithHashedPasswords);
  },

  insertStores: (stores) => StoreModel.insertMany(stores),

  insertOrders: (orders) => OrderModel.insertMany(orders),

  insertDeliveries: (deliveries) => DeliveryModel.insertMany(deliveries),
};

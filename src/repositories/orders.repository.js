import OrderModel from "../models/order.model.js";

// Qué campos de cliente y comercio se muestran dentro de un pedido (sin datos sensibles)
const CUSTOMER_FIELDS = "firstName lastName email";
const STORE_FIELDS = "name address";

const withRelations = (query) =>
  query.populate("customer", CUSTOMER_FIELDS).populate("store", STORE_FIELDS).lean();

export const ordersRepository = {
  findAll: () => withRelations(OrderModel.find().sort({ createdAt: -1 })),

  findById: (id) => withRelations(OrderModel.findById(id)),

  create: (orderData) => OrderModel.create(orderData),

  updateStatus: (id, status) =>
    OrderModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean(),

  deleteById: (id) => OrderModel.findByIdAndDelete(id).lean()
};

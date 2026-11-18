import OrderModel from "../models/order.model.js";

// Campos de cliente y comercio que se muestran dentro de un pedido.
const CUSTOMER_FIELDS = "firstName lastName email";
const STORE_FIELDS = "name address";

// Agrega las relaciones de cliente y comercio a la consulta.
const withRelations = (query) =>
  query
    .populate("customer", CUSTOMER_FIELDS)
    .populate("store", STORE_FIELDS)
    .lean();

export const ordersRepository = {
  findAll: ({ skip, limit }) =>
    withRelations(
      OrderModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ),

  countAll: () => OrderModel.countDocuments(),

  findById: (id) => withRelations(OrderModel.findById(id)),

  create: async (orderData) => {
    const order = await OrderModel.create(orderData);
    return ordersRepository.findById(order._id);
  },

  updateStatus: (id, status) =>
    withRelations(
      OrderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true },
      ),
    ),

  deleteById: (id) => OrderModel.findByIdAndDelete(id).lean(),

  addProof: (id, proof) =>
    withRelations(
      OrderModel.findByIdAndUpdate(
        id,
        { proof },
        { new: true, runValidators: true },
      ),
    ),
};

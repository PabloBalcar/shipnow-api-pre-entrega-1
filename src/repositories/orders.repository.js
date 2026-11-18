import OrderModel from "../models/order.model.js";

// Qué campos de cliente y comercio se muestran dentro de un pedido.
const CUSTOMER_FIELDS = "firstName lastName email";
const STORE_FIELDS = "name address";

// Agrega las relaciones de cliente y comercio a la consulta.
const withRelations = (query) =>
  query
    .populate("customer", CUSTOMER_FIELDS)
    .populate("store", STORE_FIELDS)
    .lean();

export const ordersRepository = {
  // Obtiene los pedidos de una página determinada.
  findAll: ({ skip, limit }) =>
    withRelations(
      OrderModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ),

  // Cuenta el total de pedidos registrados.
  countAll: () => OrderModel.countDocuments(),

  findById: (id) => withRelations(OrderModel.findById(id)),

  create: (orderData) => OrderModel.create(orderData),

  updateStatus: (id, status) =>
    OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).lean(),

  deleteById: (id) => OrderModel.findByIdAndDelete(id).lean(),

  // Guarda los metadatos del comprobante y devuelve el pedido actualizado.
  addProof: (id, proof) =>
    withRelations(
      OrderModel.findByIdAndUpdate(
        id,
        { proof },
        { new: true, runValidators: true },
      ),
    ),
};

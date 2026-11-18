import DeliveryModel from "../models/delivery.model.js";

const COURIER_FIELDS = "firstName lastName email role";

const withRelations = (query) =>
  query
    .populate({
      path: "order",
      populate: [
        { path: "customer", select: "firstName lastName email" },
        { path: "store", select: "name address" },
      ],
    })
    .populate("courier", COURIER_FIELDS)
    .lean();

export const deliveriesRepository = {
  findAll: ({ skip, limit }) =>
    withRelations(
      DeliveryModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ),

  countAll: () => DeliveryModel.countDocuments(),

  findById: (id) => withRelations(DeliveryModel.findById(id)),

  findByOrder: (orderId) => DeliveryModel.findOne({ order: orderId }).lean(),

  create: (deliveryData) => DeliveryModel.create(deliveryData),

  updateIfStatus: (id, expectedStatus, updates) =>
    withRelations(
      DeliveryModel.findOneAndUpdate(
        { _id: id, status: expectedStatus },
        updates,
        { new: true, runValidators: true },
      ),
    ),

  addProof: (id, proof) =>
    withRelations(
      DeliveryModel.findByIdAndUpdate(
        id,
        { proof },
        { new: true, runValidators: true },
      ),
    ),

  restoreAfterFailedSync: (id, currentStatus, previousData) =>
    DeliveryModel.findOneAndUpdate(
      { _id: id, status: currentStatus },
      {
        $set: {
          status: previousData.status,
          courier: previousData.courier,
          deliveredAt: previousData.deliveredAt,
        },
        $pop: { history: 1 },
      },
      { new: true, runValidators: true },
    ),
};

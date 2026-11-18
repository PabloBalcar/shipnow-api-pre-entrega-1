import StoreModel from "../models/store.model.js";

export const storesRepository = {
  // Obtiene los comercios de una página determinada.
  findAll: ({ skip = 0, limit = 10 } = {}) =>
    StoreModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

  // Cuenta el total de comercios registrados.
  countAll: () => StoreModel.countDocuments(),

  findById: (id) => StoreModel.findById(id).lean(),

  exists: (id) => StoreModel.exists({ _id: id }),

  create: (storeData) => StoreModel.create(storeData),

  updateById: (id, storeData) =>
    StoreModel.findByIdAndUpdate(id, storeData, {
      new: true,
      runValidators: true,
    }).lean(),

  deleteById: (id) => StoreModel.findByIdAndDelete(id).lean(),
};

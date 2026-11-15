import StoreModel from "../models/store.model.js";

export const storesRepository = {
  findAll: () => StoreModel.find().sort({ createdAt: -1 }).lean(),

  findById: (id) => StoreModel.findById(id).lean(),

  exists: (id) => StoreModel.exists({ _id: id }),

  create: (storeData) => StoreModel.create(storeData),

  updateById: (id, storeData) =>
    StoreModel.findByIdAndUpdate(id, storeData, { new: true, runValidators: true }).lean(),

  deleteById: (id) => StoreModel.findByIdAndDelete(id).lean()
};

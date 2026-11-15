import ProductModel from "../models/product.model.js";

const STORE_FIELDS = "name address";

export const productsRepository = {
  // filters: objeto simple, ej. { status: "available", store: "<id>" }
  findAll: (filters = {}) =>
    ProductModel.find(filters).populate("store", STORE_FIELDS).sort({ createdAt: -1 }).lean(),

  findById: (id) => ProductModel.findById(id).populate("store", STORE_FIELDS).lean(),

  create: (productData) => ProductModel.create(productData),

  updateById: (id, productData) =>
    ProductModel.findByIdAndUpdate(id, productData, { new: true, runValidators: true }).lean(),

  deleteById: (id) => ProductModel.findByIdAndDelete(id).lean()
};

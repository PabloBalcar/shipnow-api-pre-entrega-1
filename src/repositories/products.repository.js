import ProductModel from "../models/product.model.js";

const STORE_FIELDS = "name address";

export const productsRepository = {
  // Obtiene productos aplicando filtros y paginación.
  findAll: (filters = {}, { skip = 0, limit = 10 } = {}) =>
    ProductModel.find(filters)
      .populate("store", STORE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

  // Cuenta los productos que cumplen los mismos filtros.
  countAll: (filters = {}) => ProductModel.countDocuments(filters),

  findById: (id) =>
    ProductModel.findById(id).populate("store", STORE_FIELDS).lean(),

  create: (productData) => ProductModel.create(productData),

  updateById: (id, productData) =>
    ProductModel.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).lean(),

  deleteById: (id) => ProductModel.findByIdAndDelete(id).lean(),
};

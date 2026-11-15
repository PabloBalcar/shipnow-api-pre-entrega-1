import { productsRepository } from "../repositories/products.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import { AppError } from "../utils/app-error.js";

const notFound = () => new AppError("Producto no encontrado", 404);

// Regla de negocio: el estado depende del stock
const getStatusByStock = (stock) =>
  stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

const validateStock = (stock) => {
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    throw new AppError("El stock debe ser un número entero mayor o igual a 0", 400);
  }
};

export const productsService = {
  getStatusByStock,

  // Por defecto solo se listan productos con stock.
  // Con ?includeOutOfStock=true se listan todos.
  getAll: ({ includeOutOfStock, store } = {}) => {
    const filters = {};
    if (includeOutOfStock !== "true") filters.status = PRODUCT_STATUS.AVAILABLE;
    if (store) filters.store = store;
    return productsRepository.findAll(filters);
  },

  getById: async (id) => {
    const product = await productsRepository.findById(id);
    if (!product) throw notFound();
    return product;
  },

  create: async (productData) => {
    const { name, description, price, stock, store } = productData;

    if (!name || price === undefined || !store) {
      throw new AppError("Faltan datos obligatorios (name, price, store)", 400);
    }

    validateStock(stock);

    if (!(await storesRepository.exists(store))) {
      throw new AppError("Comercio no encontrado", 404);
    }

    const finalStock = stock ?? 0;

    return productsRepository.create({
      name,
      description,
      price,
      store,
      stock: finalStock,
      status: getStatusByStock(finalStock)
    });
  },

  update: async (id, productData) => {
    const { status, ...dataToUpdate } = productData; // el estado no se setea a mano, se deduce del stock

    validateStock(dataToUpdate.stock);

    if (dataToUpdate.store && !(await storesRepository.exists(dataToUpdate.store))) {
      throw new AppError("Comercio no encontrado", 404);
    }

    if (dataToUpdate.stock !== undefined) {
      dataToUpdate.status = getStatusByStock(dataToUpdate.stock);
    }

    const product = await productsRepository.updateById(id, dataToUpdate);
    if (!product) throw notFound();
    return product;
  },

  delete: async (id) => {
    const product = await productsRepository.deleteById(id);
    if (!product) throw notFound();
    return product;
  }
};

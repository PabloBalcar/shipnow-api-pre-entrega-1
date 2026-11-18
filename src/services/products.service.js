import { productsRepository } from "../repositories/products.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";
import { validateAllowedFields } from "../utils/validate-allowed-fields.js";
import { getPaginationParams, buildPagination } from "../utils/pagination.js";

const notFound = () => new AppError(ERRORS.PRODUCT_NOT_FOUND);
const storeNotFound = () => new AppError(ERRORS.STORE_NOT_FOUND);

const PRODUCT_FIELDS = ["name", "description", "price", "stock", "store"];

const getStatusByStock = (stock) =>
  stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

const validateStock = (stock) => {
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    throw new AppError(ERRORS.INVALID_PRODUCT_STOCK);
  }
};

export const productsService = {
  getStatusByStock,

  getAll: async (query = {}) => {
    const { includeOutOfStock, store } = query;
    const pagination = getPaginationParams(query);

    const filters = {};

    if (includeOutOfStock !== "true") {
      filters.status = PRODUCT_STATUS.AVAILABLE;
    }

    if (store) {
      filters.store = store;
    }

    const [products, total] = await Promise.all([
      productsRepository.findAll(filters, pagination),
      productsRepository.countAll(filters),
    ]);

    return {
      payload: products,
      pagination: buildPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  },

  getById: async (id) => {
    const product = await productsRepository.findById(id);
    if (!product) throw notFound();
    return product;
  },

  create: async (productData) => {
    validateAllowedFields(productData, PRODUCT_FIELDS);

    const { name, description, price, stock, store } = productData;

    if (!name || price === undefined || !store) {
      throw new AppError(ERRORS.PRODUCT_REQUIRED_FIELDS);
    }

    validateStock(stock);

    if (!(await storesRepository.exists(store))) {
      throw storeNotFound();
    }

    const finalStock = stock ?? 0;

    return productsRepository.create({
      name,
      description,
      price,
      store,
      stock: finalStock,
      status: getStatusByStock(finalStock),
    });
  },

  update: async (id, productData) => {
    validateAllowedFields(productData, PRODUCT_FIELDS);

    validateStock(productData.stock);

    if (
      productData.store &&
      !(await storesRepository.exists(productData.store))
    ) {
      throw storeNotFound();
    }

    const dataToUpdate = { ...productData };

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
  },
};

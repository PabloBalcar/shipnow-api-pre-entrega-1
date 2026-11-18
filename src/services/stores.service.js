import { storesRepository } from "../repositories/stores.repository.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";
import { validateAllowedFields } from "../utils/validate-allowed-fields.js";
import { getPaginationParams, buildPagination } from "../utils/pagination.js";

const notFound = () => new AppError(ERRORS.STORE_NOT_FOUND);

const CREATE_FIELDS = ["name", "address", "owner"];
const UPDATE_FIELDS = ["name", "address"];

export const storesService = {
  getAll: async (query = {}) => {
    const pagination = getPaginationParams(query);

    const [stores, total] = await Promise.all([
      storesRepository.findAll(pagination),
      storesRepository.countAll(),
    ]);

    return {
      payload: stores,
      pagination: buildPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  },

  getById: async (id) => {
    const store = await storesRepository.findById(id);
    if (!store) throw notFound();
    return store;
  },

  create: async (storeData) => {
    validateAllowedFields(storeData, CREATE_FIELDS);
    return storesRepository.create(storeData);
  },

  update: async (id, storeData) => {
    validateAllowedFields(storeData, UPDATE_FIELDS);

    const store = await storesRepository.updateById(id, storeData);

    if (!store) throw notFound();

    return store;
  },

  delete: async (id) => {
    const store = await storesRepository.deleteById(id);
    if (!store) throw notFound();
    return store;
  },
};

import { storesRepository } from "../repositories/stores.repository.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";

const notFound = () => new AppError(ERRORS.STORE_NOT_FOUND);

export const storesService = {
  getAll: () => storesRepository.findAll(),

  getById: async (id) => {
    const store = await storesRepository.findById(id);
    if (!store) throw notFound();
    return store;
  },

  create: (storeData) => storesRepository.create(storeData),

  update: async (id, storeData) => {
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

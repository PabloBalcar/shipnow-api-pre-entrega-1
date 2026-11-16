import { usersRepository } from "../repositories/users.repository.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";

const notFound = () => new AppError(ERRORS.USER_NOT_FOUND);

export const usersService = {
  getAll: () => usersRepository.findAll(),

  getById: async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) throw notFound();
    return user;
  },

  create: async (userData) => {
    if (userData.email) {
      const existingUser = await usersRepository.findByEmail(userData.email);
      if (existingUser) throw new AppError(ERRORS.USER_ALREADY_EXISTS);
    }
    return usersRepository.create(userData);
  },

  update: async (id, userData) => {
    if (userData.email) {
      const existingUser = await usersRepository.findByEmail(userData.email);
      if (existingUser && String(existingUser._id) !== String(id)) {
        throw new AppError(ERRORS.USER_ALREADY_EXISTS);
      }
    }

    const user = await usersRepository.updateById(id, userData);
    if (!user) throw notFound();
    return user;
  },

  delete: async (id) => {
    const user = await usersRepository.deleteById(id);
    if (!user) throw notFound();
    return user;
  },
};

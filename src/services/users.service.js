import { usersRepository } from "../repositories/users.repository.js";
import { AppError } from "../utils/app-error.js";

const notFound = () => new AppError("Usuario no encontrado", 404);

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
      if (existingUser) throw new AppError("El email ya está registrado", 409);
    }
    return usersRepository.create(userData);
  },

  update: async (id, userData) => {
    if (userData.email) {
      const existingUser = await usersRepository.findByEmail(userData.email);
      if (existingUser && String(existingUser._id) !== String(id)) {
        throw new AppError("El email ya está registrado", 409);
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
  }
};

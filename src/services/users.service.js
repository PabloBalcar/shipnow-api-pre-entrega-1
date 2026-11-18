import { unlink } from "node:fs/promises";
import { usersRepository } from "../repositories/users.repository.js";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";
import { DOCUMENT_TYPES, USER_ROLES } from "../constants/index.js";
import { hashPassword } from "../utils/password.js";
import { validateAllowedFields } from "../utils/validate-allowed-fields.js";
import logger from "../config/logger.js";
import { getPaginationParams, buildPagination } from "../utils/pagination.js";

const notFound = () => new AppError(ERRORS.USER_NOT_FOUND);

const CREATE_FIELDS = ["firstName", "lastName", "email", "password"];

const UPDATE_FIELDS = ["firstName", "lastName", "email"];

export const usersService = {
  getAll: async (query = {}) => {
    const pagination = getPaginationParams(query);

    const [users, total] = await Promise.all([
      usersRepository.findAll(pagination),
      usersRepository.countAll(),
    ]);

    return {
      payload: users,
      pagination: buildPagination({
        page: pagination.page,
        limit: pagination.limit,
        total,
      }),
    };
  },

  getById: async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) throw notFound();
    return user;
  },

  create: async (userData) => {
    validateAllowedFields(userData, CREATE_FIELDS);

    if (userData.email) {
      const existingUser = await usersRepository.findByEmail(userData.email);

      if (existingUser) {
        throw new AppError(ERRORS.USER_ALREADY_EXISTS);
      }
    }

    const data = {
      ...userData,
      role: USER_ROLES.USER,
    };

    if (typeof data.password === "string") {
      data.password = await hashPassword(data.password);
    }

    return usersRepository.create(data);
  },

  update: async (id, userData) => {
    validateAllowedFields(userData, UPDATE_FIELDS);

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

  addDocument: async (id, file, type) => {
    if (!file) {
      throw new AppError(ERRORS.FILE_REQUIRED);
    }

    try {
      const allowedTypes = [
        DOCUMENT_TYPES.USER_DOCUMENT,
        DOCUMENT_TYPES.DRIVER_LICENSE,
        DOCUMENT_TYPES.ADMINISTRATIVE_DOCUMENT,
      ];

      if (!allowedTypes.includes(type)) {
        throw new AppError(ERRORS.INVALID_DOCUMENT_TYPE);
      }

      const existingUser = await usersRepository.findById(id);

      if (!existingUser) {
        throw notFound();
      }

      const document = {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        type,
        uploadedAt: new Date(),
      };

      const updatedUser = await usersRepository.addDocument(id, document);

      if (!updatedUser) {
        throw notFound();
      }

      logger.info("Documento de usuario cargado correctamente", {
        userId: id,
        fileName: file.filename,
        documentType: type,
      });

      return updatedUser;
    } catch (error) {
      await unlink(file.path).catch(() => {});
      throw error;
    }
  },
};

import { usersService } from "../services/users.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    res.json({ status: "success", payload: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.uid);
    res.json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await usersService.update(req.params.uid, req.body);
    res.json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await usersService.delete(req.params.uid);
    res.json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

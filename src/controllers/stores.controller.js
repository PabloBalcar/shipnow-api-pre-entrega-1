import { storesService } from "../services/stores.service.js";

export const getStores = async (req, res, next) => {
  try {
    const result = await storesService.getAll(req.query);

    res.json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreById = async (req, res, next) => {
  try {
    const store = await storesService.getById(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const store = await storesService.create(req.body);
    res.status(201).json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const store = await storesService.update(req.params.sid, req.body);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storesService.delete(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

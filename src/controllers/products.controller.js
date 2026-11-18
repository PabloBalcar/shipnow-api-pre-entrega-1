import { productsService } from "../services/products.service.js";

export const getProducts = async (req, res, next) => {
  try {
    const result = await productsService.getAll(req.query);

    res.json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getById(req.params.pid);
    res.json({ status: "success", payload: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productsService.create(req.body);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productsService.update(req.params.pid, req.body);
    res.json({ status: "success", payload: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productsService.delete(req.params.pid);
    res.json({ status: "success", payload: product });
  } catch (error) {
    next(error);
  }
};

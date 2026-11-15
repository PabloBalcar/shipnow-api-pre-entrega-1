import { mocksService } from "../services/mocks.service.js";

export const mocksController = {
  getUsers: async (req, res, next) => {
    try {
      const payload = mocksService.generateUsers(req.query.qty ?? 5);

      res.status(200).json({
        status: "success",
        payload,
      });
    } catch (error) {
      next(error);
    }
  },

  getCouriers: async (req, res, next) => {
    try {
      const payload = mocksService.generateCouriers(req.query.qty ?? 5);

      res.status(200).json({
        status: "success",
        payload,
      });
    } catch (error) {
      next(error);
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const payload = mocksService.generateOrders(req.query.qty ?? 5);

      res.status(200).json({
        status: "success",
        payload,
      });
    } catch (error) {
      next(error);
    }
  },

  getDeliveries: async (req, res, next) => {
    try {
      const payload = mocksService.generateDeliveries(req.query.qty ?? 5);

      res.status(200).json({
        status: "success",
        payload,
      });
    } catch (error) {
      next(error);
    }
  },

  seed: async (req, res, next) => {
    try {
      const payload = await mocksService.seed(req.query.qty ?? 5);

      res.status(201).json({
        status: "success",
        payload,
      });
    } catch (error) {
      next(error);
    }
  },
};

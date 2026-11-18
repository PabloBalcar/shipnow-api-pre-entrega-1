import { deliveriesService } from "../services/deliveries.service.js";

export const getDeliveries = async (req, res, next) => {
  try {
    const result = await deliveriesService.getAll(req.query);

    res.json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.getById(req.params.did);

    res.json({
      status: "success",
      payload: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const createDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.create(req.body);

    res.status(201).json({
      status: "success",
      payload: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const assignDeliveryCourier = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.assignCourier(
      req.params.did,
      req.body,
    );

    res.json({
      status: "success",
      message: "Repartidor asignado correctamente",
      payload: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.updateStatus(
      req.params.did,
      req.body,
    );

    res.json({
      status: "success",
      message: "Estado de entrega actualizado correctamente",
      payload: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryTracking = async (req, res, next) => {
  try {
    const tracking = await deliveriesService.getTracking(req.params.did);

    res.json({
      status: "success",
      payload: tracking,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDeliveryProof = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.addProof(req.params.did, req.file);

    res.json({
      status: "success",
      message: "Comprobante de entrega cargado correctamente",
      payload: delivery,
    });
  } catch (error) {
    next(error);
  }
};

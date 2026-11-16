import { ordersService } from "../services/orders.service.js";

export const getOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getAll();
    res.json({ status: "success", payload: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getById(req.params.oid);
    res.json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.create(req.body);
    res.status(201).json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateStatus(
      req.params.oid,
      req.body.status,
    );
    res.json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await ordersService.delete(req.params.oid);
    res.json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

// Cargar un comprobante asociado a un pedido.
export const uploadOrderProof = async (req, res, next) => {
  try {
    const order = await ordersService.addProof(req.params.oid, req.file);

    res.status(200).json({
      status: "success",
      message: "Comprobante cargado correctamente",
      payload: order,
    });
  } catch (error) {
    next(error);
  }
};

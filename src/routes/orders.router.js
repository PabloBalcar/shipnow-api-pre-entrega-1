import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  uploadOrderProof,
} from "../controllers/orders.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { validateFileSignature } from "../middlewares/file-signature.middleware.js";

const router = Router();

router.get("/", getOrders);
router.get("/:oid", getOrderById);

router.post("/", createOrder);

// Subir y validar un comprobante asociado a un pedido.
router.post(
  "/:oid/proof",
  upload.single("proof"),
  validateFileSignature,
  uploadOrderProof,
);

router.put("/:oid/status", updateOrderStatus);
router.delete("/:oid", deleteOrder);

export default router;

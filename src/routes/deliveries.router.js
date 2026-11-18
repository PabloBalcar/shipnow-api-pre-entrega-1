import { Router } from "express";
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  assignDeliveryCourier,
  updateDeliveryStatus,
  getDeliveryTracking,
  uploadDeliveryProof,
} from "../controllers/deliveries.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { validateFileSignature } from "../middlewares/file-signature.middleware.js";

const router = Router();

router.get("/", getDeliveries);
router.post("/", createDelivery);

router.get("/:did/tracking", getDeliveryTracking);
router.put("/:did/assign", assignDeliveryCourier);
router.put("/:did/status", updateDeliveryStatus);

// Cargar comprobante de una entrega.
router.post(
  "/:did/proof",
  upload.single("proof"),
  validateFileSignature,
  uploadDeliveryProof,
);

router.get("/:did", getDeliveryById);

export default router;

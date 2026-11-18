import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadUserDocument,
} from "../controllers/users.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { validateFileSignature } from "../middlewares/file-signature.middleware.js";

const router = Router();

router.get("/", getUsers);
router.get("/:uid", getUserById);

router.post("/", createUser);

// Subir y validar un documento asociado a un usuario.
router.post(
  "/:uid/documents",
  upload.single("document"),
  validateFileSignature,
  uploadUserDocument,
);

router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);

export default router;

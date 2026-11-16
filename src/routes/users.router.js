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

const router = Router();

router.get("/", getUsers);
router.get("/:uid", getUserById);

router.post("/", createUser);

// Subir un documento asociado a un usuario.
router.post("/:uid/documents", upload.single("document"), uploadUserDocument);

router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);

export default router;

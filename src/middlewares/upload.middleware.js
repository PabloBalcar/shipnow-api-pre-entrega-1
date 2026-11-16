import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";

// Tipos MIME permitidos para documentos y comprobantes.
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Carpetas donde se almacenan los archivos.
const UPLOAD_DIRECTORIES = {
  document: path.resolve("uploads/documents"),
  proof: path.resolve("uploads/proofs"),
};

// Crear las carpetas si todavía no existen.
Object.values(UPLOAD_DIRECTORIES).forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

// Definir dónde y con qué nombre se guarda cada archivo.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const directory = UPLOAD_DIRECTORIES[file.fieldname];

    if (!directory) {
      return callback(new AppError(ERRORS.INVALID_UPLOAD_FIELD));
    }

    callback(null, directory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${randomUUID()}${extension}`;

    callback(null, fileName);
  },
});

// Validar el tipo MIME.
const fileFilter = (req, file, callback) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(new AppError(ERRORS.INVALID_FILE_TYPE));
  }

  callback(null, true);
};

// Configuración centralizada de Multer.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;

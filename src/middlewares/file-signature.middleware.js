import { open, unlink } from "node:fs/promises";
import { AppError } from "../utils/app-error.js";
import { ERRORS } from "../constants/errors.js";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const isValidFileContent = (mimeType, buffer) => {
  switch (mimeType) {
    case "application/pdf":
      return buffer.includes(Buffer.from("%PDF-"));

    case "image/jpeg":
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );

    case "image/png":
      return (
        buffer.length >= PNG_SIGNATURE.length &&
        buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
      );

    case "image/webp":
      return (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );

    default:
      return false;
  }
};

export const validateFileSignature = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const fileHandle = await open(req.file.path, "r");
    let header;

    try {
      const buffer = Buffer.alloc(1024);

      const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, 0);

      header = buffer.subarray(0, bytesRead);
    } finally {
      await fileHandle.close();
    }

    if (!isValidFileContent(req.file.mimetype, header)) {
      await unlink(req.file.path).catch(() => {});
      return next(new AppError(ERRORS.INVALID_FILE_CONTENT));
    }

    return next();
  } catch (error) {
    await unlink(req.file.path).catch(() => {});
    return next(error);
  }
};

import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export const isHashedPassword = (password) =>
  typeof password === "string" && password.startsWith("scrypt$");

export const hashPassword = async (password) => {
  if (typeof password !== "string" || password.length === 0) {
    throw new TypeError("La contraseña debe ser un texto no vacío");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

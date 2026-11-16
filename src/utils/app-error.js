// Error personalizado de la aplicación.
// Los services lo utilizan para informar errores de negocio al middleware global.

export class AppError extends Error {
  constructor({ code, message, statusCode = 500, details = null }) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

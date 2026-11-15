// Error con código HTTP asociado. Lo lanzan los services y lo traduce el middleware de errores.
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

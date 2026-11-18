import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description:
        "API REST para la gestión de logística, comercios, pedidos, productos y entregas.",
    },
    servers: [
      {
        url: "/",
        description: "Servidor actual",
      },
    ],
  },
  apis: ["./src/docs/**/*.{js,yaml}"],
};

export const swaggerSpecs = swaggerJsdoc(swaggerOptions);

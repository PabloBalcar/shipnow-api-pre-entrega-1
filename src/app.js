import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import productsRouter from "./routes/products.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/app-error.js";
import { ERRORS } from "./constants/errors.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API funcionando",
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/mocks", mocksRouter);

// Las rutas inexistentes también pasan por el middleware global.
app.use((req, res, next) => {
  next(new AppError(ERRORS.ROUTE_NOT_FOUND));
});

// El middleware de errores siempre debe quedar al final.
app.use(errorHandler);

export default app;

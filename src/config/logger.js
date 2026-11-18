import winston from "winston";
import fs from "node:fs";
import path from "node:path";
import { config } from "./env.config.js";

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "red",
    warning: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
  },
};

winston.addColors(customLevels.colors);

const logsDirectory = path.resolve("logs");

fs.mkdirSync(logsDirectory, { recursive: true });

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const extra = Object.keys(metadata).length
      ? ` ${JSON.stringify(metadata)}`
      : "";

    return `${timestamp} [${level}] ${message}${extra}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Cuando el nivel configurado es info, también se registran
// las solicitudes HTTP para conservar la actividad general.
const combinedLogLevel = config.logLevel === "info" ? "http" : config.logLevel;

const transports = [
  new winston.transports.File({
    filename: path.join(logsDirectory, "combined.log"),
    level: combinedLogLevel,
    format: fileFormat,
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),

  new winston.transports.File({
    filename: path.join(logsDirectory, "error.log"),
    level: "error",
    format: fileFormat,
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),
];

// La consola se utiliza exclusivamente durante el desarrollo.
if (config.nodeEnv === "development") {
  transports.push(
    new winston.transports.Console({
      level: config.logLevel,
      format: consoleFormat,
    }),
  );
}

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: "debug",
  defaultMeta: { service: "shipnow-api" },
  transports,
});

export default logger;

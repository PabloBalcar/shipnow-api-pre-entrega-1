import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "node:fs";
import path from "node:path";
import { config } from "./env.config.js";

// Winston utiliza números menores para los niveles más graves.
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

const isProduction = config.nodeEnv === "production";
const minimumLevel = isProduction ? "info" : "debug";

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

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: minimumLevel,
  defaultMeta: { service: "shipnow-api" },
  transports: [
    new winston.transports.Console({
      level: minimumLevel,
      format: consoleFormat,
    }),

    new DailyRotateFile({
      filename: path.join(logsDirectory, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      zippedArchive: true,
      level: minimumLevel,
      format: fileFormat,
    }),

    new DailyRotateFile({
      filename: path.join(logsDirectory, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      zippedArchive: true,
      level: "error",
      format: fileFormat,
    }),
  ],
});

export default logger;

import mongoose from "mongoose";
import dns from "node:dns";
import { config } from "./env.config.js";

dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB conectado");
};

export default connectDB;

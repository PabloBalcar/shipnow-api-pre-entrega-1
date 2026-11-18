import mongoose from "mongoose";
import { DELIVERY_STATUS } from "../constants/index.js";

const deliveryHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const proofSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    proof: {
      type: proofSchema,
      default: null,
    },
    history: {
      type: [deliveryHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const DeliveryModel =
  mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);

export default DeliveryModel;

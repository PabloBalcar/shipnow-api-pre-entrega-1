import mongoose from "mongoose";
import { PRODUCT_STATUS } from "../constants/index.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.OUT_OF_STOCK
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;

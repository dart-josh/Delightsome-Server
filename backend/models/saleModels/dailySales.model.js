import mongoose from "mongoose";

// Daily sales record
const dailySalesSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        storePrice: {
          type: Number,
          min: 0,
          required: [true, "Store Price is required"],
        },
        onlinePrice: {
          type: Number,
          min: 0,
          required: [true, "Online Price is required"],
        },
        openingQuantity: {
          type: Number,
          required: true,
        },
        added: {
          type: Number,
          default: 0,
        },
        request: {
          type: Number,
          default: 0,
        },
        takeOut: {
          type: Number,
          default: 0,
        },
        return: {
          type: Number,
          default: 0,
        },
        terminalCollected: {
          type: Number,
          default: 0,
        },
        terminalReturn: {
          type: Number,
          default: 0,
        },
        badProduct: {
          type: Number,
          default: 0,
        },
        online: {
          type: Number,
          default: 0,
        },
        quantitySold: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const DailySalesRecord = mongoose.model(
  "DailySalesRecord",
  dailySalesSchema,
);

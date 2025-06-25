import mongoose from "mongoose";
import { GiSolderingIron } from "react-icons/gi";

// Daily sales record
const terminalDailySalesSchema = new mongoose.Schema(
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
        openingQuantity: {
          type: Number,
          required: true,
        },
        collected: {
          type: Number,
          default: 0,
        },
        returned: {
          type: Number,
          default: 0,
        },
        sold: {
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

export const TerminalDailySalesRecord = mongoose.model(
  "TerminalDailySalesRecord",
  terminalDailySalesSchema,
);

export const DangoteDailySalesRecord = mongoose.model(
  "DangoteDailySalesRecord",
  terminalDailySalesSchema,
);

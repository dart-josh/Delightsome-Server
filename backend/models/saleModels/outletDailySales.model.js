import mongoose from "mongoose";
import { GiSolderingIron } from "react-icons/gi";

// Daily sales record
const outletDailySalesSchema = new mongoose.Schema(
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

export const OutletDailySalesRecord = mongoose.model(
  "OutletDailySalesRecord",
  outletDailySalesSchema,
);

export const TerminalDailySalesRecord = mongoose.model(
  "TerminalDailySalesRecord",
  outletDailySalesSchema,
);

export const DangoteDailySalesRecord = mongoose.model(
  "DangoteDailySalesRecord",
  outletDailySalesSchema,
);

import mongoose from "mongoose";

const terminalSalesSchema = new mongoose.Schema(
  {
    recordDate: {
      type: Date,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    orderPrice: {
      type: Number,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: [true, "Order quantity is required"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    shortNote: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    splitPaymentMethod: [
      {
        paymentMethod: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    discountPrice: {
      type: Number,
      default: 0,
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const TerminalSalesRecord = mongoose.model(
  "TerminalSalesRecord",
  terminalSalesSchema,
);

export default TerminalSalesRecord;

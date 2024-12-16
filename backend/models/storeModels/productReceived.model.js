import mongoose from "mongoose";

const productReceivedSchema = new mongoose.Schema(
  {
    recordDate: {
      type: Date,
      required: true,
    },
    recordId: {
      type: String,
      required: true,
    },
    verifiedDate: {
      type: Date,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    supplier: {
      type: String,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    shortNote: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    totalQuantity: {
      type: Number,
      min: 1,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedBy: [
      {
        staff: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff",
          required: true,
        },
        time: { type: Date, default: function () {
          const now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          return now;
        }, },
      },
    ],
  },
  { timestamps: true },
);

const ProductReceived = mongoose.model(
  "ProductReceived",
  productReceivedSchema,
);

export default ProductReceived;

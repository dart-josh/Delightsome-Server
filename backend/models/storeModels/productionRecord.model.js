import mongoose from "mongoose";

const productionRecordSchema = new mongoose.Schema(
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
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    products:{
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
          },
        },
      ],
      required: true,
    },
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

const ProductionRecord = mongoose.model(
  "ProductionRecord",
  productionRecordSchema,
);

export default ProductionRecord;

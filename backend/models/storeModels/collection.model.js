import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
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
    staffResponsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
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
    collectionType: {
      type: String,
      required: true,
      enum: ['Collected', 'Returned']
    },
  },
  {
    timestamps: true,
  },
);

export const OutletCollectionRecord = mongoose.model(
  "OutletCollectionRecord",
  collectionSchema,
);

export const TerminalCollectionRecord = mongoose.model(
  "TerminalCollectionRecord",
  collectionSchema,
);

export const DangoteCollectionRecord = mongoose.model(
  "DangoteCollectionRecord",
  collectionSchema,
);

import mongoose from "mongoose";

const restockRawMaterialsSchema = new mongoose.Schema(
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
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterials",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    itemsUsed: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterials",
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

const RestockRawMaterialsRecord = mongoose.model(
  "RestockRawMaterialsRecord",
  restockRawMaterialsSchema,
);

export default RestockRawMaterialsRecord;

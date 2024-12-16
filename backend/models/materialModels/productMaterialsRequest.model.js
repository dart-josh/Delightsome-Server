import mongoose from "mongoose";

const productMaterialsRequestSchema = new mongoose.Schema(
  {
    recordDate: {
      type: Date,
      required: true,
    },
    recordId: {
      type: String,
      required: true,
    },
    authorizedDate: {
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
          ref: "ProductMaterials",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    purpose: {
      type: String,
    },
    authorized: {
      type: Boolean,
      default: false,
    },
    authorizedBy: {
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

const ProductMaterialsRequestRecord = mongoose.model(
  "ProductMaterialsRequestRecord",
  productMaterialsRequestSchema,
);

export default ProductMaterialsRequestRecord;

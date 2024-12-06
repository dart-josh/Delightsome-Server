import mongoose from "mongoose";

const rawMaterialsRequestSchema = new mongoose.Schema({
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
            ref: "RawMaterials",
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
          time: { type: Date, default: Date.now },
        },
      ],
},
    {timestamps: true}
);

const RawMaterialsRequestRecord = mongoose.model("RawMaterialsRequestRecord", rawMaterialsRequestSchema);

export default RawMaterialsRequestRecord;
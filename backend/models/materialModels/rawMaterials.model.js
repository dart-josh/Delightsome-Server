import mongoose from "mongoose";

const rawMaterialsSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    restockLimit: {
        type: Number,
        default: 0,
    },
    measurementUnit: {
        type: String,
        required: true,
        enum: ["Weight", "Count"]
    },
    storeType: {
        type: String,
        required: true,
        enum: ["Store", "Processed"]
    }
},
    {timestamps: true}
);

const RawMaterials = mongoose.model("RawMaterials", rawMaterialsSchema);

export default RawMaterials;
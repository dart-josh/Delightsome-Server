import mongoose from "mongoose";

const productMaterialsSchema = new mongoose.Schema({
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
},
    {timestamps: true}
);

const ProductMaterials = mongoose.model("ProductMaterials", productMaterialsSchema);

export default ProductMaterials;
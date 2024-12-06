import mongoose from "mongoose";

const productMaterialsCategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    sort: {
        type: Number,
        required: true,
    },
});

const ProductMaterialsCategory = mongoose.model('ProductMaterialsCategory', productMaterialsCategorySchema);

export default ProductMaterialsCategory;
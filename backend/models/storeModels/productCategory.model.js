import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    sort: {
        type: Number,
        required: true,
    },
});

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

export default ProductCategory;
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product Name is required']
    },
    code: {
        type: String,
    },
    category: {
        type: String,
        required: [true, 'Product Category is required'],
    },
    quantity: {
        type: Number,
        default: 0,
    },
    restockLimit: {
        type: Number,
        default: 0,
    },
    storePrice: {
        type: Number,
        min: 0,
        required: [true, 'Store Price is required'],
    },
    onlinePrice: {
        type: Number,
        min: 0,
        required: [true, 'Online Price is required'],
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    sort: {
        type: String,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
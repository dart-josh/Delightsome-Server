import mongoose from "mongoose";

const terminalProductSchema = new mongoose.Schema({
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
    isAvailable: {
        type: Boolean,
        default: true,
    },
    sort: {
        type: String,
    },
}, {
    timestamps: true,
});

const TerminalProduct = mongoose.model('TerminalProduct', terminalProductSchema);
export const DangoteProduct = mongoose.model('DangoteProduct', terminalProductSchema);

export default TerminalProduct;
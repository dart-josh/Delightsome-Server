import mongoose from "mongoose";

const rawMaterialsCategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    sort: {
        type: Number,
        required: true,
    },
});

const RawMaterialsCategory = mongoose.model('RawMaterialsCategory', rawMaterialsCategorySchema);

export default RawMaterialsCategory;
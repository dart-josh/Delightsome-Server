import mongoose from "mongoose";

const custommerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Fullname is required']
    },
    nickName: {
        type: String,
    },
    contactPhone: {
        type: String,
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
    },
    birthday: {
        type: String,
    },
    customerType: {
        type: String,
        required: true,
        enum: ["Store", "Terminal", "Online"],
    },
},
{ timestamps: true },
);

const Customer = mongoose.model("Customer", custommerSchema);

export default Customer;

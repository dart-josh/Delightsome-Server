import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: [true, 'Fullname is required']
    },
    nickName: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['Management', 'Production', 'Sales', 'Terminal', 'Admin'],
    },
    fullaccess: {
        type: Boolean,
        default: false,
    },
    backDate: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
    },
    pin: {
        type: String,
    }
},
{ timestamps: true },
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;

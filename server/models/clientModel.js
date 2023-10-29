import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    birthday: {
        type: String
    },
    age: {
        type: Number
    },
    membershipStatus: {
        type: String,
        enum: ["active", "inactive"]
    },
    waiver: {
        type: Boolean
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }

});

export default mongoose.model('Client', ClientSchema)
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
    birthdate: {
        type: Date
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

},{timestamps: true}
);

export default mongoose.model('Client', ClientSchema)
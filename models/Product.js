import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        tags: {
            type: [String],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        images: {
            type: [String],
            required: true,
        },
        favoriteCount: {
            type: Number,
            default: 0,
        },
        ownerId: {
            type: Number,
        },
    },
    {
        timestamps: true,
    },
);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
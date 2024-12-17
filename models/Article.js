import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
    {
        id: {
            type: String,
        },
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

const Article = mongoose.model('Article', ArticleSchema);

export default Article;
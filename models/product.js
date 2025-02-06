import mongoose, { Types } from "mongoose";

const ProductSchma = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 1,
      // maxLength: 10,
    },
    description: {
      type: String,
      required: true,
      // minLength: 10,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    tags: {
      type: [String],
      required: true,
      // validate: {
      //   validator: (tags) => tags.every((tag) => tag.length <= 5),
      //   message: "tag is too long",
      // }, 테스트를 위해서 잠시 지웠습니다.
    },
    favoriteCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", ProductSchma);

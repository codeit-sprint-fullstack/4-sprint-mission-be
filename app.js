import express from "express";
import { Product } from "./models/product.js";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://4-sprint-mission-fe-c56s.vercel.app",
      "http://localhost:3000",
    ],
  })
);

const asyncHandler = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      switch (e.name) {
        case "ValidationError":
          res.status(400).send({ message: e.message });
          break;
        case "CastError":
          res.status(404).send({ message: "Cannot find given id" });
          break;
        default:
          res.status(500).send({ message: e.message });
          break;
      }
    }
  };
};

app.use(express.json());

app.get(
  "/products",
  asyncHandler(async (req, res) => {
    const {
      orderBy = "recent",
      page = 1,
      pageSize = 10,
      keyword = "",
    } = req.query;
    const offset = (page - 1) * pageSize;

    if (page < 1 || pageSize < 1) {
      return res.status(400).send({
        message: "Page and limit is less than 1",
      });
    }

    const sortOption =
      orderBy === "recent" ? { createdAt: "desc" } : { favoriteCount: "desc" };

    const search = keyword
      ? {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(search)
      .select("name price createdAt favoriteCount")
      .sort(sortOption)
      .skip(offset)
      .limit(pageSize);

    const totalCount = await Product.countDocuments(search);

    res.send({ list: products, totalCount });
  })
);

app.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id).select("-updatedAt");
    res.send(product);
  })
);

app.post(
  "/products",
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).send(product);
  })
);

app.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });
    product.updatedAt = new Date();
    await product.save();

    res.send(product);
  })
);

app.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.sendStatus(204);
  })
);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started`);
});

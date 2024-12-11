import mongoose from "mongoose";
import products from "./mock.js";
import { Product } from "../models/product.js";
import { config } from "dotenv";

config();

await mongoose.connect(process.env.DATABASE_URL);

await Product.deleteMany({});
await Product.insertMany(products);

mongoose.connection.close();

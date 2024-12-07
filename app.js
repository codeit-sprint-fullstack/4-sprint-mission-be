import express from 'express';
import 'dotenv/config'; 
import mongoose from 'mongoose';
import Product from './models/Product.js';
import cors from 'cors';

const app = express();
app.use(express.json());

const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
  
  app.use(cors(corsOptions));

  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASS;
  const dbHost = process.env.DB_HOST;
  const runningPort = process.env.PORT || 3000;

  const databaseUrl = `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(databaseUrl)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error(err);
    });

function asyncHandler(handler) {
    return async function (req, res) {
        try {
            await handler(req, res);

        } catch (err) {
            if (err.name === 'ValidationError') {
                res.status(400).send({ message: err.message });
            } else if (err.name === 'CastError') {
                res.status(404).send({ message: 'Product not found' });
            } else {
                res.status(500).send({ message: err.message });
            }
        }
    }
}

// 상품 목록 조회 API
app.get('/products', asyncHandler(async (req, res) => {
    const { sort, page = 1, limit = 10, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const searchQuery = {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } } 
        ]
    };

    const sortOptions = { 
        createdAt: sort === 'recent' ? -1 : 1
     };

    const products = await Product
       .find(searchQuery)
       .sort(sortOptions)
       .skip(skip)
       .limit(parseInt(limit))
       .select("id name price createdAt");

    const total = await Product.countDocuments(searchQuery);

  res.send({
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    products,
  });
}));

// 상품 상세 조회 API
app.get('/products/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id).select('id name description price tags createdAt');

    res.send(product);

}));

// 상품 등록 API
app.post('/product', asyncHandler(async (req, res) => {
    const newProducts = await Product.create(req.body);

    res.status(201).send(newProducts);
}));

// 상품 수정 API
app.patch('/products/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    Object.keys(req.body).forEach((key) => {
        product[key] = req.body[key];
    });
    await product.save();
    res.send(product);

}));

// 상품 삭제 API
app.delete('/products/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    res.send(product);
}));

app.listen(runningPort, () => {
    console.log(`Server is running on http://localhost:${runningPort}`);
    });
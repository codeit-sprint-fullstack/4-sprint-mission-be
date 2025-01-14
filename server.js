import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient, Prisma } from '@prisma/client';
import { assert, create, pick } from 'superstruct';
import {
  CreateProduct,
  PatchProduct,
  CreateArticle,
  PatchArticle,
  CreateComment,
  PatchComment,
} from './structs.js';
import productsRouter from './routes/product.js';
import articlesRouter from './routes/articles.js';
import commentsRouter from './routes/comments.js';
// import asyncHandler from './controllers/asyncHandler.js';

dotenv.config();
const prisma = new PrismaClient();
export const app = express();
app.use(cors());
// const corsOptions = {
//   origin: ["http://127.0.0.1:5500", "https://my-todo.com"],
// };
// app.use(cors(corsOptions));
// 특정 주소에 대해서만 cors 허용. 이게 더 안전함
app.use(express.json());
// 앱 전체에서 express.json()을 사용하겠다는 의미
// req의 content-type이 application/json이면 이를 parsing해서 req body에 js객체로 담아줌)`
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// API 라우팅
app.use('/', productsRouter);
app.use('/', articlesRouter);
app.use('/', commentsRouter);

app.listen(process.env.PORT || 5500, () => console.log('Server Started'));

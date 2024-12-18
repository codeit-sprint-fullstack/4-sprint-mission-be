import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { assert } from "superstruct";
import * as dotenv from "dotenv";
import cors from "cors";
import {
  CreateProduct,
  PatchProdcut,
  CreateArticle,
  PatchArticle,
  CreateComment,
  PatchComment,
} from "./structs.js";
dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: [
      "https://4-sprint-mission-fe-c56s.vercel.app",
      "http://localhost:3000",
    ],
  })
);
app.use(express.json());

const asyncHandler = (handler) => {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (
        e.name === "StructError" ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        res.sendStatus(404);
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
};
/*********** products ***********/ //유효성 검사 추가하기
app.get(
  "/products",
  asyncHandler(async (req, res) => {
    let {
      orderBy = "recent",
      page = 1,
      pageSize = 10,
      keyword = "",
    } = req.query;
    const offset = (page - 1) * pageSize;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1
    ) {
      return res.status(400).send({
        message: "Page and pagesize is invaild",
      });
    }

    const sortOption =
      orderBy === "recent" ? { createdAt: "desc" } : { favoriteCount: "desc" };

    const search = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where: search,
      select: {
        name: true,
        price: true,
        createdAt: true,
        favoriteCount: true,
      },
      orderBy: sortOption,
      skip: parseInt(offset),
      take: parseInt(pageSize),
    });
    const totalCount = await prisma.product.count({
      where: search,
    });

    res.send({ list: products, totalCount });
  })
);

app.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        favoriteCount: true,
        images: true,
        createdAt: true,
      },
    });
    res.send(product);
  })
);

app.post(
  "/products",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateProduct);
    const product = await prisma.product.create({ data: { ...req.body } });
    res.status(201).send(product);
  })
);

app.patch(
  "/products/:id",
  asyncHandler(async (req, res) => {
    assert(req.body, PatchProdcut);
    const id = req.params.id;

    await prisma.product.findUniqueOrThrow({
      where: { id },
    });

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...req.body,
      },
    });

    res.send(product);
  })
);

app.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    await prisma.product.findUniqueOrThrow({
      where: { id },
    });

    await prisma.product.delete({
      where: { id },
    });
    res.sendStatus(204);
  })
);

/*********** articles ***********/
app.post(
  "/article",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateArticle);
    const article = await prisma.article.create({
      data: { ...req.body },
    });
    res.status(201).send(article);
  })
);

app.get(
  "/article/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const article = await prisma.article.findUniqueOrThrow({
      where: { id },
    });
    res.send(article);
  })
);

app.patch(
  "/article/:id",
  asyncHandler(async (req, res) => {
    assert(req.body, PatchArticle);
    const id = req.params.id;
    await prisma.article.findUniqueOrThrow({
      where: { id },
    });
    const article = await prisma.article.update({
      where: { id },
      data: { ...req.body },
    });
    res.send(article);
  })
);

app.delete(
  "/article/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    await prisma.article.findUniqueOrThrow({
      where: { id },
    });
    await prisma.article.delete({
      where: { id },
    });
    res.sendStatus(204);
  })
);

app.get(
  "/article",
  asyncHandler(async (req, res) => {
    const {
      orderBy = "recent",
      page = 1,
      pageSize = 10,
      keyword = "",
    } = req.query;

    page = parseInt(page);
    pageSize = parseInt(pageSize);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1
    ) {
      return res.status(400).send({
        message: "Page and pagesize is invaild",
      });
    }

    const offset = (page - 1) * pageSize;

    const sortOption =
      orderBy === recent ? { createdAt: "desc" } : { createdAt: "asc" };
    const search = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {};
    const articles = await prisma.article.findMany({
      where: { search },
      orderBy: sortOption,
      skip: parseInt(offset),
      take: parseInt(pageSize),
    });
    res.send(articles);
  })
);
/*********** Commnet ***********/
app.post(
  "/article/:id/comment",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateComment);
    const articleId = req.params.id;
    const article = await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        articleId: article.id,
      },
    });

    res.status(201).send(comment);
  })
);

app.patch(
  "/article/comment/:id",
  asyncHandler(async (req, res) => {
    assert(req.body, PatchComment);
    const commentId = req.params.id;
    await prisma.comment.findUniqueOrThrow({
      where: { id: commentId },
    });
    const { content } = req.body;

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    res.send(comment);
  })
);

app.delete(
  "/article/comment/:id",
  asyncHandler(async (req, res) => {
    const commentId = req.params.id;
    await prisma.comment.findUniqueOrThrow({
      where: { id: commentId },
    });
    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.sendStatus(204);
  })
);

app.get(
  "/article/:id/comments",
  asyncHandler(async (req, res) => {
    let { cursor, pageSize = 10 } = req.query;

    pageSize = parseInt(pageSize);
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      return res.status(400).send({
        message: "pagesize is invaild",
      });
    }

    const articleId = req.params.id;
    await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    const comments = await prisma.comment.findMany({
      where: {
        articleId,
      },
      take: parseInt(pageSize),
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "asc",
      },
    });

    const nextCursor =
      comments.length === pageSize ? comments[comments.length - 1].id : null;

    res.send({
      comments,
      nextCursor,
    });
  })
);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started`);
});

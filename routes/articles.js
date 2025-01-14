import express from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../controllers/asyncHandler.js';
import { assert } from 'superstruct';
import { CreateArticle, PatchArticle } from '../structs.js';

const router = express.Router();
const prisma = new PrismaClient();

// 게시글 등록 API
router.post(
  '/articles',
  asyncHandler(async (req, res) => {
    assert(req.body, CreateArticle);
    const article = await prisma.article.create({ data: req.body });
    // res.status(201).send(article);
    res.status(201).send(article.id);
  })
);

// 게시글 수정 API
router.patch(
  '/articles/:id',
  asyncHandler(async (req, res) => {
    assert(req.body, PatchArticle);
    const { id } = req.params;
    const article = await prisma.article.update({
      where: { id },
      data: { ...req.body },
    });
    res.send(article);
  })
);

// 게시글 삭제 API
router.delete(
  '/articles/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.article.delete({ where: { id } });
    res.sendStatus(204);
  })
);

// 게시글 목록 조회 API
router.get(
  '/articles',
  asyncHandler(async (req, res) => {
    const { sort = 'latest', skip = 0, limit = 5, keyword } = req.query;

    // sort에 따라 최신순, 좋아요순 결정
    const orderBy =
      sort === 'latest' ? { createdAt: 'desc' } : { createdAt: 'asc' };
    // sort === 'latest' ? { createdAt: 'desc' } : { favoriteCount: 'desc' };
    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
          ],
        }
      : {};
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, content: true, createdAt: true },
      orderBy,
      skip: parseInt(skip),
      take: parseInt(limit),
      where,
    });
    res.send(articles);
  })
);

// 게시글 상세 조회 API - 댓글 목록도 함께 조회
router.get(
  '/articles/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await prisma.article.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        comments: { select: { id: true, content: true, createdAt: true } },
      },
    });
    res.send(product);
  })
);

export default router;

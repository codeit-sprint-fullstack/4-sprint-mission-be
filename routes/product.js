import express from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../controllers/asyncHandler.js';
import { assert } from 'superstruct';
import { CreateProduct, PatchProduct } from '../structs.js';

const router = express.Router();
const prisma = new PrismaClient();

// 상품 등록 API
router.post(
  '/products',
  asyncHandler(async (req, res) => {
    assert(req.body, CreateProduct);
    const newProduct = await prisma.product.create({
      data: req.body,
    });
    res.status(201).send(newProduct);
  })
);

// 상품 수정 API
router.patch(
  '/products/:id',
  asyncHandler(async (req, res) => {
    assert(req.body, PatchProduct);
    const id = req.params.id;
    const product = await prisma.product.update({
      where: { id },
      data: { ...req.body },
    });
    res.send(product);
  })
);

// 상품 삭제 API
router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    await prisma.product.delete({ where: { id } });
    res.sendStatus(204);
  })
);

// 상품 목록 조회 API
router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { sort = 'latest', skip = 0, limit = 10, keyword } = req.query;

    // sort에 따라 최신순, 좋아요순 결정
    const orderBy =
      sort === 'latest' ? { createdAt: 'desc' } : { favoriteCount: 'desc' };
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      select: { id: true, name: true, price: true, createdAt: true },
      orderBy,
      skip: parseInt(skip),
      take: parseInt(limit),
      where,
    });
    /**
     * collection의 전체 document 개수 받아오기
     * - pagination 구현에 필요
     * - searchCount가 있어 현 상황에서 toatalCount는 없어도 될 것으로 보이나 일단 살려둠(2024.11.28)
     */
    // const totalCount = await Product.count();
    // skip, limit이 반영되지 않은 전체 검색 결과 개수
    const searchCount = await prisma.product.count({ where });

    const finalData = {
      // totalCount: totalCount,
      searchCount: searchCount,
      products: products,
    };
    res.send(finalData);
  })
);

// 상품 상세 조회 API - 댓글 목록 함께 조회
router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        tags: true,
        description: true,
        createdAt: true,
        comments: { select: { id: true, content: true, createdAt: true } },
      },
    });
    res.send(product);
  })
);

export default router;

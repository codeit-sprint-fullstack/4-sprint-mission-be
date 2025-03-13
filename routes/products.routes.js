import { PrismaClient } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { assert } from 'superstruct';
import checkValidate from '../middleware/checkValidate.middleware.js';
import { CreateComment, CreateProduct, PatchProduct } from '../structs.js';

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/');
  },
  filename: function (req, file, cb) {
    console.log(file);
    const extension = file.originalname.split('.').slice(-1)[0];
    cb(null, 'product' + '-' + Date.now() + '.' + extension);
  },
});

const upload = multer({ storage: storage });

const uploadMiddleware = upload.array('imgUrls');

// 상품 등록 API
router.post(
  '/',
  uploadMiddleware,
  [
    body('name')
      .exists()
      .isLength({ min: 1, max: 20 })
      .withMessage('상품명은 1-20글자입니다.'),
    body('description')
      .exists()
      .isLength({ min: 10, max: 100 })
      .withMessage('상품 소개는 10-100글자입니다.'),
    checkValidate,
  ],
  async (req, res, next) => {
    try {
      const newImgUrls = req.files.map(
        (file) => 'http://localhost:5500/static/' + file.filename
      );
      const arrayTags = req.body.tags.split(',');
      const intPrice = Number(req.body.price);
      req.body.imgUrls = newImgUrls;
      req.body.tags = arrayTags;
      req.body.price = intPrice;
      assert(req.body, CreateProduct);
      const newProduct = await prisma.product.create({
        data: req.body,
      });
      res.status(201).send(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

// 상품 수정 API
router.patch(
  '/:productId',
  uploadMiddleware,
  [
    body('name')
      .exists()
      .isLength({ min: 1, max: 20 })
      .withMessage('상품명은 1-20글자입니다.'),
    body('description')
      .exists()
      .isLength({ min: 10, max: 100 })
      .withMessage('상품 소개는 10-100글자입니다.'),
    checkValidate,
  ],
  async (req, res, next) => {
    try {
      const newImgUrls = req.files.map(
        (file) => 'http://localhost:5500/static/' + file.filename
      );
      const arrayTags = req.body.tags.split(',');
      const intPrice = Number(req.body.price);
      req.body.imgUrls = newImgUrls;
      req.body.tags = arrayTags;
      req.body.price = intPrice;
      assert(req.body, PatchProduct);
      const productId = req.params.productId;
      const product = await prisma.product.update({
        where: { id: productId },
        data: { ...req.body },
      });
      res.status(200).send(product);
    } catch (error) {
      next(error);
    }
  }
);

// 상품 삭제 API
router.delete('/:productId', async (req, res, next) => {
  try {
    const productId = req.params.productId;
    await prisma.product.delete({ where: { id: productId } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// 상품 목록 조회 API
router.get('/', async (req, res, next) => {
  try {
    const { sort = 'recent', skip = 0, limit = 10, keyword } = req.query;

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imgUrls: true,
        productLikes: true,
        createdAt: true,
        // include: { _count: { select: { productLikes: true } } },
        _count: { select: { productLikes: true } },
      },

      orderBy:
        sort === 'recent'
          ? { createdAt: 'desc' }
          : { productLikes: { _count: 'desc' } },
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

    res.send({ products, searchCount });
  } catch (error) {
    next(error);
  }
});

// 상품 상세 조회 API - 댓글 목록 함께 조회
router.get('/:productId', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        writer: true,
        price: true,
        tags: true,
        description: true,
        createdAt: true,
        imgUrls: true,
        _count: { select: { productLikes: true } },
        comments: {
          select: { id: true, content: true, createdAt: true, updatedAt: true },
        },
      },
    });

    const isFavorite = userId
      ? await prisma.productLike
          .findUnique({
            where: { productId_userId: { productId, userId } },
          })
          .then((value) => !!value)
      : false;

    const newProduct = { ...product, isFavorite };
    res.send(newProduct);
  } catch (error) {
    next(error);
  }
});

// 댓글 등록 API - 상품
router.post('/:productId/comments', async (req, res, next) => {
  try {
    assert(req.body, CreateComment);
    // 댓글 테이블에 댓글 생성
    const comment = await prisma.comment.create({ data: req.body });

    // 해당 상품에 댓글을 연결
    const { id: commentId } = comment;
    const { productId } = req.params;
    const { comments } = await prisma.product.update({
      where: { id: productId },
      data: { comments: { connect: { id: commentId } } },
      include: { comments: true },
    });
    res.status(201).send(comments);
  } catch (error) {
    next(error);
  }
});

// 댓글 목록 조회 API - 중고마켓
// 상품 정보에 댓글 목록이 배열로 있으므로 불필요할 수도
router.get('/:productId/comments', async (req, res) => {
  try {
    // 전달된 cursor가 있을 경우 생성일을 기준으로 cursor 생성
    const { productId } = req.params;
    const { cursor, limit = 10 } = req.query;
    const cursorOption =
      cursor || cursor !== ''
        ? {
            skip: 1,
            cursor: {
              id: cursor,
            },
          }
        : {};
    const comments = await prisma.comment.findMany({
      where: { productId },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      ...cursorOption,
    });
    // nextCursor 설정
    let nextCursor;
    let isLastPage = false;
    if (cursor) {
      const lastComment = comments[comments.length - 1];
      nextCursor = lastComment.id;
      isLastPage = limit > comments.length;
    }
    // 최종적으로 cursor와 comments 전달
    const finalData = isLastPage
      ? { comments } // 마지막 페이지이면 cursor전달하지 않음
      : {
          cursor: nextCursor,
          comments,
        };
    res.send(finalData);
  } catch (error) {
    next(error);
  }
});

// 상품에 좋아요 하기
router.post('/:productId/like', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!userId) throw new Error('401/Unauthorized');
    console.log(productId, userId);
    // transaction 사용
    await prisma.$transaction([
      prisma.productLike.create({ data: { userId, productId } }),
      // // 해당 상품의 favoriteCount +1
      // prisma.product.update({
      //   where: { id: productId },
      //   data: { favoriteCount: { increment: 1 } },
      // }),
    ]);

    res.status(201).send('Liked!');
  } catch (error) {
    next(error);
  }
});

// 상품에 좋아요 취소하기
router.delete('/:productId/unlike', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!userId) throw new Error('401/Unauthorized');

    await prisma.$transaction([
      prisma.productLike.delete({
        where: { productId_userId: { userId, productId } },
      }),

      // // 해당 상품의 favoriteCount -1
      // prisma.product.update({
      //   where: { id: productId },
      //   data: { favoriteCount: { decrement: 1 } },
      // }),
    ]);

    res.status(201).send('Unliked!');
  } catch (error) {
    next(error);
  }
});

export default router;

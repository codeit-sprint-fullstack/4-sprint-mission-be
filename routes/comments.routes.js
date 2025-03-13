import { PrismaClient } from '@prisma/client';
import express from 'express';
import { assert } from 'superstruct';
import { PatchComment } from '../structs.js';

const router = express.Router();
const prisma = new PrismaClient();

// 특정 댓글 조회 API
router.get(
  '/:commentId',

  async (req, res, next) => {
    try {
      const id = req.params.commentId;
      const comment = await prisma.comment.findUniqueOrThrow({
        where: { id },
      });
      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

// 댓글 전체 목록 조회 API
router.get('/', async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { NOT: { articleId: null } },
    });
    res.send(comments);
  } catch (error) {
    next(error);
  }
});

// 특정 상품의 댓글 목록 조회 API
// router.get(
//   '/products/:id/comments',
//   asyncHandler(async (req, res) => {
//     const { id: productId } = req.params;
//     const { cursor, limit = 2 } = req.query;
//     const cursorOption = cursor
//       ? {
//           skip: 1,
//           cursor: {
//             id: cursor,
//           },
//         }
//       : {};
//     const comments = await prisma.comment.findMany({
//       where: { productId },
//       ...cursorOption,
//       take: parseInt(limit),
//     });
//     res.send(comments);
//   })
// );

// 특정 게시글의 댓글 목록 조회 API
// router.get(
//   '/articles/:id/comments',
//   asyncHandler(async (req, res) => {
//     const { id: articleId } = req.params;
//     const { cursor, limit = 10 } = req.query;
//     const cursorOption = cursor
//       ? {
//           skip: 1,
//           cursor: {
//             id: cursor,
//           },
//         }
//       : {};
//     const comments = await prisma.comment.findMany({
//       where: { articleId },
//       ...cursorOption,
//     });
//     res.send(comments);
//   })
// );

// 댓글 수정 API
router.patch('/:commentId', async (req, res, next) => {
  try {
    assert(req.body, PatchComment);
    const { id: commentId } = req.params;
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: req.body,
    });
    res.send(comment);
  } catch (error) {
    next(error);
  }
});

// 댓글 삭제 API
// 댓글 삭제 시 연결은 별도로 해제(disconnect)하지 않아도 되는지??
router.delete('/:commentId', async (req, res, next) => {
  try {
    const { commentId } = req.params;
    await prisma.comment.delete({ where: { id: commentId } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from '../controllers/asyncHandler.js';
import { assert } from 'superstruct';
import { CreateComment, PatchComment } from '../structs.js';

const router = express.Router();
const prisma = new PrismaClient();

// 특정 댓글 조회 API
router.get(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUniqueOrThrow({
      where: { id: req.params.id },
    });
    res.send(comment);
  })
);

// 댓글 전체 목록 조회 API
router.get(
  '/comments',
  asyncHandler(async (req, res) => {
    console.log('댓글 조회');
    const comments = await prisma.comment.findMany({
      where: { NOT: { articleId: null } },
    });
    res.send(comments);
  })
);

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

// 댓글 등록 API - 상품
router.post(
  '/products/:id/comments',
  asyncHandler(async (req, res) => {
    assert(req.body, CreateComment);
    // 댓글 테이블에 댓글 생성
    const comment = await prisma.comment.create({ data: req.body });

    // 해당 상품에 댓글을 연결
    const { id: commentId } = comment;
    const { id: productId } = req.params;
    const { comments } = await prisma.product.update({
      where: { id: productId },
      data: { comments: { connect: { id: commentId } } },
      include: { comments: true },
    });
    res.status(201).send(comments);
  })
);

// 댓글 등록 API - 게시글
router.post(
  '/articles/:id/comments',
  asyncHandler(async (req, res) => {
    assert(req.body, CreateComment);
    // 댓글 테이블에 댓글 생성
    const comment = await prisma.comment.create({ data: req.body });

    // 해당 게시글에 댓글을 연결
    const { id: commentId } = comment;
    const { id: articleId } = req.params;
    const { comments } = await prisma.article.update({
      where: { id: articleId },
      data: { comments: { connect: { id: commentId } } },
      include: { comments: true },
    });
    res.status(201).send(comments);
  })
);

// 댓글 수정 API
router.patch(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    assert(req.body, PatchComment);
    const { id } = req.params;
    const comment = await prisma.comment.update({
      where: { id },
      data: req.body,
    });
    res.send(comment);
  })
);

// 댓글 삭제 API
// 댓글 삭제 시 연결은 별도로 해제(disconnect)하지 않아도 되는지??
router.delete(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.comment.delete({ where: { id } });
    res.sendStatus(204);
  })
);

// 댓글 목록 조회 API - 중고마켓
// 상품 정보에 댓글 목록이 배열로 있으므로 불필요할 수도
router.get(
  '/products/:id/comments',
  asyncHandler(async (req, res) => {
    // 전달된 cursor가 있을 경우 생성일을 기준으로 cursor 생성
    const { id: productId } = req.params;
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
  })
);

// 댓글 목록 조회 API - 자유게시판
// 게시글 정보에 댓글 목록이 배열로 있으므로 불필요할 수도
router.get(
  '/articles/:id/comments',
  asyncHandler(async (req, res) => {
    const { id: articleId } = req.params;
    const { cursor, limit = 10 } = req.query;
    const cursorOption = cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {};
    const comments = await prisma.comment.findMany({
      where: { articleId },
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
  })
);

export default router;

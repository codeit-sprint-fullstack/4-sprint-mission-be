import { PrismaClient } from '@prisma/client';
import express from 'express';
import { assert } from 'superstruct';
import { CreateArticle, CreateComment, PatchArticle } from '../structs.js';

const router = express.Router();
const prisma = new PrismaClient();

// 게시글 등록 API
router.post('/', async (req, res, next) => {
  try {
    assert(req.body, CreateArticle);
    const article = await prisma.article.create({ data: req.body });
    res.status(201).send(article.id);
  } catch (error) {
    next(error);
  }
});

// 게시글 수정 API
router.patch('/:articleId', async (req, res, next) => {
  try {
    assert(req.body, PatchArticle);
    const { articleId } = req.params;
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { ...req.body },
    });
    res.send(article);
  } catch (error) {
    next(error);
  }
});

// 게시글 삭제 API
router.delete('/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    await prisma.article.delete({ where: { id: articleId } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// 게시글 목록 조회 API
router.get('/', async (req, res, next) => {
  try {
    const { sort = 'latest', skip = 0, limit = 5, keyword } = req.query;

    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
          ],
        }
      : {};
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        articleLikes: true,
        _count: { select: { articleLikes: true } },
      },
      orderBy:
        sort === 'recent'
          ? { createdAt: 'desc' }
          : { articleLikes: { _count: 'desc' } },
      skip: parseInt(skip),
      take: parseInt(limit),
      where,
    });

    res.send(articles);
  } catch (error) {
    next(error);
  }
});

// 게시글 상세 조회 API - 댓글 목록도 함께 조회
router.get('/:articleId', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { articleId } = req.params;
    const article = await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        writer: true,
        content: true,
        createdAt: true,
        _count: { select: { articleLikes: true } },
        comments: { select: { id: true, content: true, createdAt: true } },
      },
    });
    const isFavorite = userId
      ? await prisma.articleLike
          .findUnique({
            where: { articleId_userId: { articleId, userId } },
          })
          .then((value) => !!value)
      : false;

    const newArticle = { ...article, isFavorite };

    res.send(newArticle);
  } catch (error) {
    next(error);
  }
});

// 댓글 등록 API - 게시글
router.post('/:articleId/comments', async (req, res, next) => {
  try {
    assert(req.body, CreateComment);
    // 댓글 테이블에 댓글 생성
    const comment = await prisma.comment.create({ data: req.body });

    // 해당 게시글에 댓글을 연결
    const { id: commentId } = comment;
    const { articleId } = req.params;
    const { comments } = await prisma.article.update({
      where: { id: articleId },
      data: { comments: { connect: { id: commentId } } },
      include: { comments: true },
    });
    res.status(201).send(comments);
  } catch (error) {
    next(error);
  }
});

// 댓글 목록 조회 API - 자유게시판
// 게시글 정보에 댓글 목록이 배열로 있으므로 불필요할 수도
router.get('/:articleId/comments', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { cursor, limit = 10 } = req.query;
    const cursorOption =
      cursor && cursor !== ''
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
  } catch (error) {
    next(error);
  }
});

// 게시글에 좋아요 하기
router.post('/:articleId/like', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.userId;

    if (!userId) throw new Error('401/Unauthorized');

    await prisma.$transaction([
      prisma.articleLike.create({ data: { userId, articleId } }),

      // // 해당 게시글의 favoriteCount +1
      // prisma.article.update({
      //   where: { id: articleId },
      //   data: { favoriteCount: { increment: 1 } },
      // }),
    ]);

    res.status(201).send('Liked');
  } catch (error) {
    next(error);
  }
});

// 게시글에 좋아요 취소하기
router.delete('/:articleId/unlike', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.userId;

    if (!userId) throw new Error('401/Unauthorized');

    await prisma.$transaction([
      prisma.articleLike.delete({
        where: { articleId_userId: { userId, articleId } },
      }),

      // // 해당 게시글의 favoriteCount -1
      // prisma.article.update({
      //   where: { id: articleId },
      //   data: { favoriteCount: { decrement: 1 } },
      // }),
    ]);

    res.status(201).send('unliked!');
  } catch (error) {
    next(error);
  }
});

export default router;

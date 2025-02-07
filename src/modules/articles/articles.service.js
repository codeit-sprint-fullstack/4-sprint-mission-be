const prisma = require("../../db/prisma/client");

async function getArticles(req, res, next) {
  try {
    const { orderBy, page, pageSize, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const sortOption =
      orderBy === "recent" ? { createdAt: "desc" } : { favoriteCount: "desc" };
    const search = keyword
      ? {
          OR: [{ title: { contains: keyword, mode: "insensitive" } }],
        }
      : {};
    const articles = await prisma.article.findMany({
      where: search,
      orderBy: sortOption,
      skip: parseInt(offset),
      take: parseInt(pageSize),
      include: { writer: { select: { id: true, nickname: true } } },
      omit: { writerId: true },
    });
    res.status(200).send(articles);
  } catch (e) {
    next(e);
  }
}

async function getArticle(req, res, next) {
  try {
    const articleId = req.params.articleId;

    const article = await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
      include: { writer: { select: { id: true, nickname: true } } },
      omit: { writerId: true },
    });

    res.send(article);
  } catch (e) {
    next(e);
  }
}

async function createArticle(req, res, next) {
  try {
    const writerId = req.userId;
    const article = await prisma.article.create({
      data: { writerId, ...req.body },
      include: {
        writer: { select: { id: true, nickname: true } },
      },
      omit: { writerId: true },
    });
    res.status(200).send(article);
  } catch (e) {
    next(e);
  }
}

async function updateArticle(req, res, next) {
  try {
    const userId = req.userId;
    const articleId = req.params.articleId;

    const findArticle = await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    if (userId !== findArticle.writerId) throw new Error("401/Unathorized");
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { ...req.body },
      include: {
        writer: { select: { id: true, nickname: true } },
      },
      omit: { writerId: true },
    });
    res.status(200).send(article);
  } catch (e) {
    next(e);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const userId = req.userId;
    const articleId = req.params.articleId;
    const findArticle = await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    if (userId !== findArticle.writerId) throw new Error("401/Unathorized");
    await prisma.article.delete({
      where: { id: articleId },
    });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}

async function likeArtice(req, res, next) {
  try {
    const userId = req.userId;
    const articleId = req.params.articleId;
    const result = await prisma.$transaction(async (prisma) => {
      //헷갈리니까 정리
      //1. 해당 article이 있는지 확인
      await prisma.article.findUniqueOrThrow({
        where: { id: articleId },
      });
      //2. 좋아요가 이미 눌려저 있는지 확인
      const existingFavorite = await prisma.favoriteArticle.findUnique({
        where: { userId_articleId: { userId, articleId } },
      });
      //만약 있으면 에러러
      if (existingFavorite) {
        throw new Error("400/Already exist favorite");
      }

      await prisma.favoriteArticle.create({
        data: { userId, articleId },
      });

      const article = await prisma.article.update({
        where: { id: articleId },
        data: { favoriteCount: { increment: 1 } },
        include: { writer: { select: { id: true, nickname: true } } },
        omit: { writerId: true },
      });
      return { ...article, isLiked: true };
    });

    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
}

async function disLikeArtice(req, res, next) {
  try {
    const userId = req.userId;
    const articleId = req.params.articleId;
    const result = await prisma.$transaction(async (prisma) => {
      //헷갈리니까 정리
      //1. 해당 article이 있는지 확인
      await prisma.article.findUniqueOrThrow({
        where: { id: articleId },
      });
      //2. 좋아요가 이미 눌려저 있는지 확인 없으면 에러러
      await prisma.favoriteArticle.findUniqueOrThrow({
        where: { userId_articleId: { userId, articleId } },
      });

      await prisma.favoriteArticle.delete({
        where: { userId_articleId: { userId, articleId } },
      });

      const article = await prisma.article.update({
        where: { id: articleId },
        data: { favoriteCount: { decrement: 1 } },
        include: { writer: { select: { id: true, nickname: true } } },
        omit: { writerId: true },
      });
      return { ...article, isLiked: false };
    });

    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
}

async function getComments(req, res, next) {
  try {
    const { cursor, pageSize } = req.query;

    const articleId = req.params.articleId;

    await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
      },
      take: pageSize,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        writer: { select: { id: true, nickname: true, image: true } },
      },
      omit: { writerId: true },
    });

    const nextCursor =
      comments.length === pageSize ? comments[comments.length - 1].id : null;

    res.status(200).send({
      comments,
      nextCursor,
    });
  } catch (e) {
    next(e);
  }
}

async function createComment(req, res, next) {
  try {
    const userId = req.userId;
    const articleId = req.params.articleId;
    await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        articleId: articleId,
        writerId: userId,
      },
      include: {
        writer: { select: { id: true, nickname: true, image: true } },
      },
      omit: { writerId: true },
    });

    res.status(201).send(comment);
  } catch (e) {
    next(e);
  }
}

const articleService = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArtice,
  disLikeArtice,
  getComments,
  createComment,
};

module.exports = articleService;

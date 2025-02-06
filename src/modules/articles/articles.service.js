const prisma = require("../../db/prisma/client");

async function getArticles(req, res, next) {
  try {
    let { orderBy, page, pageSize, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const sortOption =
      orderBy === "recent" ? { createdAt: "desc" } : { likeCount: "desc" };
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
    });

    res.send(article);
  } catch (e) {
    next(e);
  }
}

async function createArticle(req, res, next) {
  try {
    const article = await prisma.article.create({
      data: { ...req.body },
    });
    res.status(200).send(article);
  } catch (e) {
    next(e);
  }
}

async function updateArticle(req, res, next) {
  try {
    const articleId = req.params.articleId;
    await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { ...req.body },
    });
    res.status(200).send(article);
  } catch (e) {
    next(e);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const articleId = req.params.articleId;
    await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
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
    const articleId = req.params.articleId;
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.article.findUniqueOrThrow({
        where: { id: articleId },
      });
      const article = await prisma.article.update({
        where: { id: articleId },
        data: { isLiked: true },
      });
      return article;
    });

    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
}

async function disLikeArtice(req, res, next) {
  try {
    const articleId = req.params.articleId;
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.article.findUniqueOrThrow({
        where: { id: articleId },
      });

      const article = await prisma.article.update({
        where: { id: articleId },
        data: { isLiked: false },
      });
      return article;
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
      take: parseInt(pageSize),
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "asc",
      },
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
    const articleId = req.params.articleId;

    await prisma.article.findUniqueOrThrow({
      where: { id: articleId },
    });
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        articleId: articleId,
      },
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

const prisma = require("../../db/prisma/client");

async function getProducts(req, res, next) {
  try {
    const { orderBy, page, pageSize, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const sortOption =
      orderBy === "recent" ? { createdAt: "desc" } : { likeCount: "desc" };

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
      orderBy: sortOption,
      skip: offset,
      take: pageSize,
      include: { owner: { select: { id: true, nickname: true } } },
    });
    const totalCount = await prisma.product.count({
      where: search,
    });

    res.send({ list: products, totalCount });
  } catch (e) {
    next(e);
  }
}

async function getProduct(req, res, next) {
  try {
    const productId = req.params.productId;

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: { owner: { select: { id: true, nickname: true } } },
      omit: { ownerId: true },
    });

    res.send(product);
  } catch (e) {
    next(e);
  }
}

async function createProduct(req, res, next) {
  try {
    const ownerId = req.userId;
    const product = await prisma.product.create({
      data: { ownerId, ...req.body },
      include: { owner: { select: { id: true, nickname: true } } },
      omit: { ownerId: true },
    });
    res.status(200).send(product);
  } catch (e) {
    next(e);
  }
}

async function updateProduct(req, res, next) {
  try {
    const userId = req.userId;
    const productId = req.params.productId;

    const findProduct = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    if (userId !== findProduct.ownerId) throw new Error("401/Unathorized");
    const product = await prisma.product.update({
      where: { id: productId },
      data: { ...req.body },
      include: { owner: { select: { id: true, nickname: true } } },
    });
    res.status(200).send(product);
  } catch (e) {
    next(e);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    const findProduct = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    if (userId !== findProduct.ownerId) throw new Error("401/Unathorized");
    await prisma.product.delete({
      where: { id: productId },
    });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}

async function likeProduct(req, res, next) {
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    const result = await prisma.$transaction(async (prisma) => {
      //헷갈리니까 정리
      //1. 해당 product가 있는지 확인
      await prisma.product.findUniqueOrThrow({
        where: { id: productId },
      });
      //2. 좋아요가 이미 눌려저 있는지 확인
      const existingFavorite = await prisma.favoriteProduct.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      //만약 있으면 에러
      if (existingFavorite) {
        throw new Error("400/Already exist favorite");
      }

      await prisma.favoriteProduct.create({
        data: { userId, productId },
      });

      const product = await prisma.product.update({
        where: { id: productId },
        data: { favoriteCount: { increment: 1 } },
        include: { owner: { select: { id: true, nickname: true } } },
      });
      return { ...product, isLiked: true };
    });

    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
}

async function disLikeProduct(req, res, next) {
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    const result = await prisma.$transaction(async (prisma) => {
      //헷갈리니까 정리
      //1. 해당 product가 있는지 확인
      await prisma.product.findUniqueOrThrow({
        where: { id: productId },
      });
      //2. 좋아요가 이미 눌려저 있는지 확인 없으면 에러
      await prisma.favoriteProduct.findUniqueOrThrow({
        where: { userId_productId: { userId, productId } },
      });

      await prisma.favoriteProduct.delete({
        where: { userId_productId: { userId, productId } },
      });

      const product = await prisma.product.update({
        where: { id: productId },
        data: { favoriteCount: { decrement: 1 } },
        include: { owner: { select: { id: true, nickname: true } } },
      });
      return { ...product, isLiked: false };
    });

    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
}

async function getComments(req, res, next) {
  try {
    const { cursor, pageSize } = req.query;

    const productId = req.params.productId;

    await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const comments = await prisma.comment.findMany({
      where: {
        productId,
      },
      take: pageSize,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        writer: { select: { id: true, nickname: true, image: true } },
      },
      // omit: { writerId: true },
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
    const productId = req.params.productId;
    await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        productId: productId,
        writerId: userId,
      },
      include: {
        writer: { select: { id: true, nickname: true, image: true } },
      },
      // omit: { writerId: true },
    });

    res.status(201).send(comment);
  } catch (e) {
    next(e);
  }
}

const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  disLikeProduct,
  getComments,
  createComment,
};
module.exports = productService;

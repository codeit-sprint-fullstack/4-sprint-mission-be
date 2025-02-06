const express = require("express");
const articleService = require("./articles.service");
const {
  validatePageQuary,
  validateCreateAritcle,
  validateUpdateAritcle,
  validateGetComments,
  validateCommentSchema,
} = require("../../middlewares/validation/article.validation");
const { authenticatedOnly } = require("../../middlewares/auth.middleware");

const articleRouter = express.Router();

articleRouter.get("/", validatePageQuary, articleService.getArticles);
articleRouter.get("/:articleId", authenticatedOnly, articleService.getArticle);
articleRouter.post(
  "/",
  validateCreateAritcle,
  authenticatedOnly,
  articleService.createArticle
);
articleRouter.patch(
  "/:articleId",
  validateUpdateAritcle,
  articleService.updateArticle
);
articleRouter.delete(
  "/:articleId",
  authenticatedOnly,
  articleService.deleteArticle
);
articleRouter.post(
  "/:articleId/like",
  authenticatedOnly,
  articleService.likeArtice
);
articleRouter.post(
  "/:articleId/like",
  authenticatedOnly,
  articleService.disLikeArtice
);
articleRouter.post(
  "/:articleId/comments",
  validateCommentSchema,
  authenticatedOnly,
  articleService.createComment
);
articleRouter.get(
  "/:articleId/comments",
  validateGetComments,
  authenticatedOnly,
  articleService.getComments
);

module.exports = articleRouter;

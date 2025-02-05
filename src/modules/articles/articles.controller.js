const express = require("express");
const articleService = require("./articles.service");
const {
  validatePageQuary,
  validateCreateAritcle,
  validateUpdateAritcle,
  validateGetComments,
  validateCommentSchema,
} = require("../../middlewares/validation/article.validation");

const articleRouter = express.Router();

articleRouter.get("/", validatePageQuary, articleService.getArticles);
articleRouter.get("/:articleId", articleService.getArticle);
articleRouter.post("/", validateCreateAritcle, articleService.createArticle);
articleRouter.patch(
  "/:articleId",
  validateUpdateAritcle,
  articleService.updateArticle
);
articleRouter.delete("/:articleId", articleService.deleteArticle);
articleRouter.post("/:articleId/like", articleService.likeArtice);
articleRouter.post("/:articleId/like", articleService.disLikeArtice);
articleRouter.post(
  "/:articleId/comments",
  validateCommentSchema,
  articleService.createComment
);
articleRouter.get(
  "/:articleId/comments",
  validateGetComments,
  articleService.getComments
);

module.exports = articleRouter;

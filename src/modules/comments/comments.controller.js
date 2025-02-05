const express = require("express");
const commentService = require("./comments.service");
const {
  validateCommentSchema,
} = require("../../middlewares/validation/article.validation");

const commentRouter = express.Router();

commentRouter.patch(
  "/:commentId",
  validateCommentSchema,
  commentService.updateCommnet
);
commentRouter.delete("/:commentId", commentService.deleteCommnet);

module.exports = commentRouter;

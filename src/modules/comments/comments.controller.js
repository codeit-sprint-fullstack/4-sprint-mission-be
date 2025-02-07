const express = require("express");
const commentService = require("./comments.service");

const { authenticatedOnly } = require("../../middlewares/auth.middleware");
const {
  validateCommentSchema,
} = require("../../middlewares/validation/comment.validation");

const commentRouter = express.Router();

commentRouter.patch(
  "/:commentId",
  validateCommentSchema,
  authenticatedOnly,
  commentService.updateCommnet
);
commentRouter.delete(
  "/:commentId",
  authenticatedOnly,
  commentService.deleteCommnet
);

module.exports = commentRouter;

const express = require("express");
const articleRouter = require("./articles/articles.controller");
const commentRouter = require("./comments/comments.controller");
const authRouter = require("./auth/auth.controller");

const router = express.Router();

router.use("/articles", articleRouter);
router.use("/comments", commentRouter);
router.use("/auth", authRouter);
module.exports = router;

const express = require("express");
const articleRouter = require("./articles/articles.controller");
const commentRouter = require("./comments/comments.controller");
const authRouter = require("./auth/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const userRouter = require("./user/user.controller");

const router = express.Router();

router.use(authMiddleware);

router.use("/articles", articleRouter);
router.use("/comments", commentRouter);
router.use("/auth", authRouter);
router.use("/user/me", userRouter);

module.exports = router;

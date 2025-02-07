const express = require("express");
const userService = require("./user.service");
const { authenticatedOnly } = require("../../middlewares/auth.middleware");

const userRouter = express.Router();

userRouter.get("/", authenticatedOnly, userService.getUserMe);

module.exports = userRouter;

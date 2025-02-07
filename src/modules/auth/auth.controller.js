const express = require("express");
const authService = require("./auth.service");
const {
  validateSignUpContext,
  validateSignInContext,
} = require("../../middlewares/validation/auth.vaildation");

const authRouter = express.Router();

authRouter.post("/signUp", validateSignUpContext, authService.signUp);
authRouter.post("/signIn", validateSignInContext, authService.logIn);
authRouter.post("/refresh-token", authService.refreshToken);

module.exports = authRouter;

const express = require("express");

const authRouter = express.Router();

authRouter.post("/signUp");
authRouter.post("/signIn");
authRouter.post("/refresh-token");

module.exports = authRouter;

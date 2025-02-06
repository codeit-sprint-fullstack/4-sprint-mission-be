const express = require("express");

const productRouter = express.Router();

productRouter.get("/");

module.exports = productRouter;

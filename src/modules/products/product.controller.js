const express = require("express");
const {
  validatePageQuary,
  validateCreateProduct,
  validateUpdateProduct,
} = require("../../middlewares/validation/product.validation");
const productService = require("./product.service");
const { authenticatedOnly } = require("../../middlewares/auth.middleware");
const {
  validateCommentSchema,
  validateGetComments,
} = require("../../middlewares/validation/comment.validation");

const productRouter = express.Router();

productRouter.get("/", validatePageQuary, productService.getProducts);
productRouter.get("/:productId", authenticatedOnly, productService.getProduct);
productRouter.post(
  "/",
  validateCreateProduct,
  authenticatedOnly,
  productService.createProduct
);
productRouter.patch(
  "/:productId",
  validateUpdateProduct,
  authenticatedOnly,
  productService.updateProduct
);
productRouter.delete(
  "/:productId",
  authenticatedOnly,
  productService.deleteProduct
);
productRouter.post(
  "/:productId/favorite",
  authenticatedOnly,
  productService.likeProduct
);
productRouter.delete(
  "/:productId/favorite",
  authenticatedOnly,
  productService.disLikeProduct
);

productRouter.post(
  "/:productId/comments",
  authenticatedOnly,
  validateCommentSchema,
  productService.createComment
);
productRouter.get(
  "/:productId/comments",
  validateGetComments,
  productService.getComments
);

productRouter.delete("/:productId/comments");

module.exports = productRouter;

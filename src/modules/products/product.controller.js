const express = require("express");
const {
  validatePageQuary,
  validateCreateProduct,
  validateUpdateProduct,
} = require("../../middlewares/validation/product.validation");
const productService = require("./product.service");
const { authenticatedOnly } = require("../../middlewares/auth.middleware");

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

module.exports = productRouter;

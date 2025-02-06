const { z } = require("zod");

const pageQuarySchema = z.object({
  page: z
    .number()
    .int({ message: "page is not number" })
    .positive({ message: "page must be greater than 1" }),
  pageSize: z
    .number()
    .int({ message: "pagesize is not number" })
    .positive({ message: "pagesize must be greater than 1" }),
  orderBy: z.string().default("recent"),
  keyword: z.string().default(""),
});

const createProductSchema = z.object({
  images: z
    .array(z.string().url({ message: "image must be a valid URL" }))
    .optional(),
  name: z
    .string()
    .min(1, { message: "name must be 1 or more characters long" })
    .max(20, { message: "name must be 20 or fewer characters long" }),
  description: z
    .string()
    .min(1, { message: "content must be 1 or more characters long" }),
  price: z.number().int().min(0, { message: "price must be greater than 0" }),
  tags: z.array(z.string()).optional(),
});

const updatedProductSchema = createProductSchema.partial();

function validatePageQuary(req, res, next) {
  try {
    const parsedQuery = pageQuarySchema.safeParse({
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
      orderBy: req.query.orderBy,
      keyword: req.query.keyword,
    });

    if (!parsedQuery.success) {
      throw new Error(`400/Validation error: ${parsedQuery.error}`);
    }
    req.query = parsedQuery.data;
    next();
  } catch (e) {
    next(e);
  }
}

function validateCreateProduct(req, res, next) {
  try {
    const parsedProductContext = createProductSchema.safeParse({
      images: req.body.images,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      tags: req.body.tags,
    });
    if (!parsedProductContext.success) {
      throw new Error(`400/Validation error: ${parsedProductContext.error}`);
    }

    req.body = parsedProductContext.data;
    next();
  } catch (e) {
    next(e);
  }
}

function validateUpdateProduct(req, res, next) {
  try {
    const parsedProductContext = updatedProductSchema.safeParse({
      images: req.body.images,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      tags: req.body.tags,
    });
    if (!parsedProductContext.success) {
      throw new Error(`400/Validation error: ${parsedProductContext.error}`);
    }

    req.body = parsedProductContext.data;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  validatePageQuary,
  validateCreateProduct,
  validateUpdateProduct,
};

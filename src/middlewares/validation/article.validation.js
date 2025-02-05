const { Cursor } = require("mongoose");
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

const createArticleSchema = z.object({
  image: z.string().url({ message: "image must be a valid URL" }).optional(),
  title: z
    .string()
    .min(1, { message: "title must be 1 or more characters long" })
    .max(20, { message: "title must be 20 or fewer characters long" }),
  content: z
    .string()
    .min(1, { message: "content must be 1 or more characters long" }),
});

const updatedArticleSchema = createArticleSchema.partial();

const commentQuarySchema = z.object({
  cursor: z.string().optional(),
  pageSize: z
    .number()
    .int()
    .min(1, { message: "pagesize must be greater than 1" }),
});

const commentContentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "content must be 1 or more characters long" }),
});

function validatePageQuary(req, res, next) {
  try {
    const parsedQuery = pageQuarySchema.safeParse({
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
      orderBy: req.query.orderBy,
      keyword: req.query.keyword,
    });

    if (!parsedQuery.success) {
      const errorMessages = parsedQuery.error.errors.map((err) => err.message);
      throw new Error(`400/Validation error: ${errorMessages.join(", ")}`);
    }
    req.query = parsedQuery.data;
    next();
  } catch (e) {
    next(e);
  }
}
function validateCreateAritcle(req, res, next) {
  try {
    const parsedArticleContext = createArticleSchema.safeParse({
      image: req.body.image,
      title: req.body.title,
      content: req.body.content,
    });
    if (!parsedArticleContext.success) {
      const errorMessages = parsedArticleContext.error.errors.map(
        (err) => err.message
      );
      throw new Error(`400/Validation error: ${errorMessages.join(", ")}`);
    }

    req.body = parsedArticleContext.data;
    next();
  } catch (e) {
    next(e);
  }
}

function validateUpdateAritcle(req, res, next) {
  try {
    const parsedArticleContext = updatedArticleSchema.safeParse({
      image: req.body.image,
      title: req.body.title,
      content: req.body.content,
    });
    if (!parsedArticleContext.success) {
      const errorMessages = parsedArticleContext.error.errors.map(
        (err) => err.message
      );
      throw new Error(`400/Validation error: ${errorMessages.join(", ")}`);
    }

    req.body = parsedArticleContext.data;
    next();
  } catch (e) {
    next(e);
  }
}

function validateGetComments(req, res, next) {
  try {
    const parsedQuery = commentQuarySchema.safeParse({
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
      cursor: req.query.cursor,
    });
    if (!parsedQuery.success) {
      const errorMessages = parsedQuery.error.errors.map((err) => err.message);
      throw new Error(`400/Validation error: ${errorMessages.join(", ")}`);
    }

    req.query = parsedQuery.data;
    next();
  } catch (e) {
    next(e);
  }
}

function validateCommentSchema(req, res, next) {
  try {
    const parsedContent = commentContentSchema.safeParse({
      content: req.body.content,
    });
    if (!parsedContent.success) {
      const errorMessages = parsedContent.error.errors.map(
        (err) => err.message
      );
      throw new Error(`400/Validation error: ${errorMessages.join(", ")}`);
    }
    req.body = parsedContent.data;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  validatePageQuary,
  validateCreateAritcle,
  validateUpdateAritcle,
  validateGetComments,
  validateCommentSchema,
};

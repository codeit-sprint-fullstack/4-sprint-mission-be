const { z } = require("zod");

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

function validateGetComments(req, res, next) {
  try {
    const parsedQuery = commentQuarySchema.safeParse({
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
      cursor: req.query.cursor,
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

function validateCommentSchema(req, res, next) {
  try {
    const parsedContent = commentContentSchema.safeParse({
      content: req.body.content,
    });
    if (!parsedContent.success) {
      throw new Error(`400/Validation error: ${parsedContent.error}`);
    }
    req.body = parsedContent.data;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { validateCommentSchema, validateGetComments };

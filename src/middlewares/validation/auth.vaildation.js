const { z } = require("zod");

const signUpContextSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  nickname: z
    .string()
    .min(1, { message: "nickname must be 1 or more characters long" })
    .max(20, { message: "nickname must be 20 or fewer characters long" }),
  password: z
    .string()
    .min(8, { message: "password must be 8 or more characters long" }),
  passwordConfirmation: z
    .string()
    .min(8, { message: "password must be 8 or more characters long" })
    .refine((data) => data.passwordConfirmation === data.password, {
      message: "password don't match ",
    }),
});

const signInContextSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "password must be 8 or more characters long" }),
});

function validateSignUpContext(req, res, next) {
  try {
    const parsedContext = signUpContextSchema.safeParse({
      email: req.body.email,
      nickname: req.body.nickname,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation,
    });

    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.body = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
}

function validateSignInContext(req, res, next) {
  try {
    const parsedContext = signInContextSchema.safeParse({
      email: req.body.email,
      password: req.body.password,
    });

    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.body = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  validateSignUpContext,
  validateSignInContext,
};

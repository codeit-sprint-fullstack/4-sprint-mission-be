import { validationResult } from 'express-validator';

function checkValidate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  console.log(errors);
  return res
    .status(400)
    .json({ message: errors.array({ onlyFirstError: true })[0].msg });
}

export default checkValidate;

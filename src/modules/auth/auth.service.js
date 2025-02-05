const prisma = require("../../db/prisma/client");
const bcrypt = require("bcrypt");

async function logIn(req, res, next) {
  try {
  } catch (e) {
    next(e);
  }
}

async function signUp(req, res, next) {
  try {
    const { email, nickname, password, passwordConfirmation } = req.body;
    const encryptedPassword = bcrypt.hash(password, 12);
  } catch (e) {
    next(e);
  }
}

// Example Value
// Schema
// {
//   "email": "example@email.com",
//   "nickname": "nickname",
//   "password": "password",
//   "passwordConfirmation": "password"
// }

async function refreshToken(req, res, next) {
  try {
  } catch (e) {
    next(e);
  }
}

const authService = { logIn, signUp, refreshToken };

module.exports = authService;

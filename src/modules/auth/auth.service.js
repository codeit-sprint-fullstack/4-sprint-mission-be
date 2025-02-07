const prisma = require("../../db/prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createToken(data) {
  try {
    const payload = {
      sub: data.id,
      email: data.email,
      nickname: data.nickname,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });
    return { accessToken, refreshToken };
  } catch (e) {
    throw new Error(e);
  }
}

async function logIn(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const userForPassword = await prisma.user.findUniqueOrThrow({
        where: { email },
        select: { encryptedPassword: true },
      });

      const checkPassword = await bcrypt.compare(
        password,
        userForPassword.encryptedPassword
      );
      if (!checkPassword) {
        throw new Error("400/Incorrect password");
      }
      const user = await prisma.user.findUniqueOrThrow({
        where: { email },
      });
      const data = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      };
      const { accessToken, refreshToken } = createToken(data);
      return { accessToken, refreshToken, user };
    });
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
}

async function signUp(req, res, next) {
  try {
    const { email, nickname, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const isExistingEmail = await tx.user.findUnique({
        where: { email },
      });
      if (isExistingEmail) throw new Error("400/email is already exist");

      const isExistingNickname = await tx.user.findUnique({
        where: { nickname },
      });
      if (isExistingNickname) throw new Error("400/nickname is already exist");

      const newUser = await tx.user.create({
        data: { email, nickname, encryptedPassword },
      });

      const data = {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
      };
      const { accessToken, refreshToken } = createToken(data);
      return { accessToken, refreshToken, user: newUser };
    });

    res.status(201).send(result);
  } catch (e) {
    next(e);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken: prevRefreshToken } = req.body;
    const { sub, email, nickname } = jwt.verify(
      prevRefreshToken,
      process.env.JWT_SECRET_KEY
    );
    const data = {
      id: sub,
      email,
      nickname,
    };
    const { accessToken } = createToken(data);

    res.status(200).send({ accessToken });
  } catch (e) {
    next(e);
  }
}

const authService = { logIn, signUp, refreshToken };

module.exports = authService;

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const router = express.Router();
const prisma = new PrismaClient();

const jwtSecretKey = process.env.JWT_SECRET_KEY;

// 전체 유저 조회
router.get('/', async (req, res, next) => {
  // #swagger.tags=['User']
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// 회원가입
router.post('/sign-up', async (req, res, next) => {
  /*
   #swagger.tags = ['User']
   #swagger.summary = '회원 가입'
   #swagger.description = '이메일과 닉네임, 비밀번호를 입력받아 회원 가입을 한다'
   #swagger.security = [{
       "bearerAuth": []
   }]
   #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                  "type": "object",
                    "properties": {
                      "email": {
                        "type": "string",
                        "required": true,
                        "example": "test@test.com"
                      },
                      "nickname": {
                        "type": "string",
                        "required": true,
                        "example": "닉네임"
                      },
                      "password": {
                        "type": "string",
                        "required": true,
                        "example": "11111111"
                      }
                    }
                },
                example: {
                    "email": "test@test.com",
                    "nickname": "닉네임",
                    "password": "11111111"
                },
            },
        }
    }
    #swagger.responses[200] = {
        description: "유저 phone 수정 완료",
        content: {
            "application/json": {
                schema: {
                    "data": {
                        "phone": "010-0000-0000",
                    }
                },
                example: {
                    "data": {
                        "phone": "010-1111-2222",
                    }
                },
            }
        }
    }
*/

  try {
    const { email, nickname, password } = req.body;

    if (!validator.isEmail(email)) throw new Error('400/Malformed email');
    if (!validator.isLength(password, { min: 8 }))
      throw new Error('400/Password should be at least 8 characters');
    if (validator.isEmpty(nickname)) throw new Error('400/Too short nickname');

    // 회원가입 로직
    // 1. 이미 가입된 유저인지(email) 확인
    const existingUser = await prisma.user.findUnique({
      where: { OR: [{ nickname }, { email }] },
    });

    if (existingUser) throw new Error('400/Already used email');

    // 2. 비밀번호 암호화
    const encryptedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, encryptedPassword, nickname, image: 'https://imgae..' },
      omit: { encryptedPassword: true },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// 로그인
router.post('/log-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) throw new Error('400/Malformed email');
    if (!validator.isLength(password, { min: 8 }))
      throw new Error('400/Password should be at least 8 characters');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('400/No user founded');

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.encryptedPassword
    );
    if (!isPasswordCorrect) throw new Error('400/Wrong password');

    const payload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };
    const accessToken = jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' });
    const refreshToken = jwt.sign(payload, jwtSecretKey, { expiresIn: '2d' });

    const data = { accessToken, refreshToken };

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// 토큰 재발급
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { prevRefreshToken } = req.body;
    const { sub, email, nickname } = jwt.verify(prevRefreshToken, jwtSecretKey);
    // 받아온 payload에서 iat, exp는 제외(있으면 중복값이라 에러 발생)
    const payload = { sub, email, nickname };

    const accessToken = jwt.sign(payload, jwtSecretKey, { expiresIn: '2h' });
    const refreshToken = jwt.sign(payload, jwtSecretKey, { expiresIn: '2d' });

    const data = { accessToken, refreshToken };

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const error = new Error('400/Invalid token');

      return next(error);
    }
    next(error);
  }
});

// 내 정보 조회
router.get('/me', async (req, res, next) => {
  try {
    const userId = req.userId;
    const me = await prisma.user.findUnique({
      where: { id: userId },
      omit: { encryptedPassword: true },
    });

    res.status(200).json(me);
  } catch (error) {
    next(error);
  }
});

export default router;

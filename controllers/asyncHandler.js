import { Prisma } from '@prisma/client';

// 비동기 오류 처리를 위한 함수(하지 않으면 오류 시 서버 자체가 죽어버림)
function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (
        e.name === 'StructError' ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({
          message: e.message,
        });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        res.sendStatus(404);
      } else {
        res.status(500).send({
          message: e.message,
        });
      }
    }
  };
}
export default asyncHandler;

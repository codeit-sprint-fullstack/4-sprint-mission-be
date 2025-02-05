const { Prisma } = require("@prisma/client");

function errorHandler(err, req, res, next) {
  console.error("error는 ", err);
  if (
    err.name === "StructError" ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    res.status(400).send({ message: e.message });
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.sendStatus(404);
  } else {
    const [statusCodeText, message] = err.message.split("/");
    const statusCode = Number(statusCodeText);

    if (isNaN(statusCode)) return res.status(500).send("unknown error");

    res.status(statusCode).send(message);
    res.status(500).send({ message: e.message });
  }
}

module.exports = errorHandler;

const prisma = require("../../db/prisma/client");

async function getUserMe(req, res, next) {
  const userId = req.userId;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { email: true },
  });
  res.status(200).send(user);
}

const userService = { getUserMe };

module.exports = userService;

const { PrismaClient } = require("@prisma/client");
const { omit } = require("superstruct");

const prisma = new PrismaClient({
  omit: {
    user: {
      encryptedPassword: true,
    },
  },
});

module.exports = prisma;

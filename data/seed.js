import products from "./mock.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.product.deleteMany({});
    await prisma.product.createMany({
      data: products,
      skipDuplicates: true,
    });
  } catch (e) {
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
main().catch((e) => {
  process.exit(1);
});

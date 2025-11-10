import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("adminpass", 10);
  const volunteerHash = await bcrypt.hash("volunteer", 10);

  console.log("Seeding users...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMIN",
      passwordHash
    }
  });

  const vol1 = await prisma.user.upsert({
    where: { email: "vol1@example.com" },
    update: {},
    create: {
      name: "Volunteer One",
      email: "vol1@example.com",
      role: "VOLUNTEER",
      passwordHash: volunteerHash
    }
  });

  const vol2 = await prisma.user.upsert({
    where: { email: "vol2@example.com" },
    update: {},
    create: {
      name: "Volunteer Two",
      email: "vol2@example.com",
      role: "VOLUNTEER",
      passwordHash: volunteerHash
    }
  });

  console.log({ admin: admin.email, vol1: vol1.email, vol2: vol2.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
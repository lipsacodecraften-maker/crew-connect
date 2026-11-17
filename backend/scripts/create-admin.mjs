
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required."
    );
  }

  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error(
      "Password must contain at least 10 characters, one letter and one number."
    );
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error(
      "An admin account with this email already exists. No changes made."
    );
  }

  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  const passwordHash = `scrypt$${salt}$${derived.toString("hex")}`;

  const admin = await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: "super_admin",
      status: "active",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  console.log("Production admin created successfully:");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

const DEMO_ACCOUNTS = [
  {
    name: "Demo Super Admin",
    email: "superadmin@crewconnect.local",
    password: "CrewConnect#2026",
    role: "super_admin",
  },
  {
    name: "Demo Operations Manager",
    email: "manager@crewconnect.local",
    password: "Manager#2026",
    role: "operations_manager",
  },
  {
    name: "Demo Coordinator",
    email: "coordinator@crewconnect.local",
    password: "Coordinator#2026",
    role: "coordinator",
  },
  {
    name: "Demo Viewer",
    email: "viewer@crewconnect.local",
    password: "Viewer#2026",
    role: "viewer",
  },
];

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo admin accounts in production.");
  }

  for (const account of DEMO_ACCOUNTS) {
    const passwordHash = await hashPassword(account.password);
    const user = await prisma.adminUser.upsert({
      where: { email: account.email },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        status: "active",
      },
      update: {
        name: account.name,
        passwordHash,
        role: account.role,
        status: "active",
      },
    });
    console.log(`✔ ${user.email} (${user.role})`);
  }

  console.log("\nDemo admin accounts are ready.");
  console.log("Sign in at /admin/login with any email above and its password.");
}

main()
  .catch((error) => {
    console.error("\nSeed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

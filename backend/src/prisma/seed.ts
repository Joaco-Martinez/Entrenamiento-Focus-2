import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const password = "Entrenamiento378";
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    {
      email: "matiasledesmah@hotmail.com",
      firstName: "Matias",
      lastName: "Ledesma",
      role: Role.ADMIN,
      country: "arg",
      phone: null,
    },
    {
      email: "Knnoofficial@gmail.com",
      firstName: "Franco",
      lastName: "Cano",
      role: Role.ADMIN,
      country: "arg",
      phone: null,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        country: user.country,
        phone: user.phone,
        passwordHash,
      },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        country: user.country,
        phone: user.phone,
        passwordHash,
      },
    });
  }

  console.log("✅ Seed completado.");
  console.log("- Matias Ledesma | matiasledesmah@hotmail.com");
  console.log("- Franco Cano | Knnoofficial@gmail.com");
  console.log(`🔐 Contraseña para todos: ${password}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
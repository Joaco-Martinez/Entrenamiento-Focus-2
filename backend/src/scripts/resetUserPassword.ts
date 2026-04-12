import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";

const USER_ID = "bf2957aa-01a0-4678-8b1a-d70d9759a86d";
const NEW_PASSWORD = "Joaco1907!";

async function main() {
  console.log("🔐 Reseteando contraseña...");

  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
  });

  if (!user) {
    throw new Error("❌ Usuario no encontrado");
  }

  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

  await prisma.user.update({
    where: { id: USER_ID },
    data: {
      passwordHash: hashedPassword,
    },
  });

  console.log("✅ Contraseña actualizada correctamente");
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
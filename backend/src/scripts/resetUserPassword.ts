import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";

const USER_ID = "17c524c7-2a20-41a5-82ea-ca70c921a9b9";
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
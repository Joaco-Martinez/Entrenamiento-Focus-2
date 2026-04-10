import { PrismaClient, ProductResourceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.upsert({
    where: {
      id: "mentoria-focus-product-id",
    },
    update: {
      title: "Entrenamiento Focus",
      description:
        "Mentoría privada con clases en vivo, grabaciones, soporte por WhatsApp y feedback personalizado.",
      arPrice: 19500,
      usdPrice: 15,
      isActive: true,
      isSubscription: true,
      requiresPremium: true,
      coverImageUrl:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1773600142/mercadopago-white_g42ckf.png",
      resourceType: ProductResourceType.LINK,
      resourceUrl: "https://www.notion.so/Bienvenido-a-Entrenamiento-Focus-3190f88a3140803b9",
    },
    create: {
      id: "mentoria-focus-product-id",
      title: "Entrenamiento Focus",
      description:
        "Mentoría privada con clases en vivo, grabaciones, soporte por WhatsApp y feedback personalizado.",
      arPrice: 19500,
      usdPrice: 15,
      isActive: true,
      isSubscription: true,
      requiresPremium: true,
      coverImageUrl:
        "https://res.cloudinary.com/deb7jg37j/image/upload/v1773600142/mercadopago-white_g42ckf.png",
      resourceType: ProductResourceType.LINK,
      resourceUrl: "https://www.notion.so/Bienvenido-a-Entrenamiento-Focus-3190f88a3140803b9",
    },
  });

  console.log("✅ Producto creado/actualizado:", product);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
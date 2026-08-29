import { prisma } from "../prisma/client";
import { generateUniqueSlug } from "../common/utils/slug";

export async function listPublic() {
  return prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getBySlug(slug: string) {
  return prisma.article.findUnique({ where: { slug } });
}

export async function listAdmin() {
  return prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function create(data: any) {
  const slug = await generateUniqueSlug(
    data.title,
    async (slug) => Boolean(await prisma.article.findUnique({ where: { slug } }))
  );
  return prisma.article.create({ data: { ...data, slug } });
}

export async function update(id: string, data: any) {
  return prisma.article.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.article.delete({ where: { id } });
}

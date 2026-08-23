import { prisma } from "../prisma/client";

function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let counter = 2;

  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

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
  const slug = await generateUniqueSlug(data.title);
  return prisma.article.create({ data: { ...data, slug } });
}

export async function update(id: string, data: any) {
  return prisma.article.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.article.delete({ where: { id } });
}

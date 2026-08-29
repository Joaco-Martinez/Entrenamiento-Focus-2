export function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>
) {
  const base = slugify(title);
  let slug = base;
  let counter = 2;

  while (await exists(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

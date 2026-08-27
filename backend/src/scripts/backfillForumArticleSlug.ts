import { prisma } from "../prisma/client";
import { extractArticleSlugFromText } from "../common/utils/articleLink";

function selfTest() {
  console.log("=== SELF-TEST (sin tocar la base) ===");
  const cases: Array<{ label: string; content: string; expected: string | null }> = [
    { label: "Dither-like post (URL en su propia linea)", content: "Dither: un ruido que en teoria mejora tu mezcla.\n\nhttp://localhost:3000/articulos/asd", expected: "asd" },
    { label: "URL inline con texto alrededor", content: "Miren este articulo: https://www.entrenamientofocus.com.ar/articulos/asd es una genialidad", expected: "asd" },
    { label: "URL con slash final", content: "https://www.entrenamientofocus.com.ar/articulos/asd/", expected: "asd" },
    { label: "Sin ningun link", content: "Che alguien sabe que compresor usar para voces?", expected: null },
    { label: "Link externo, no es articulo", content: "Miren este video https://youtube.com/watch?v=abc123", expected: null },
  ];

  let ok = true;
  for (const c of cases) {
    const got = extractArticleSlugFromText(c.content);
    const pass = got === c.expected;
    if (!pass) ok = false;
    console.log(
      `${pass ? "OK  " : "FAIL"} | ${c.label} | esperado=${c.expected} obtenido=${got}`
    );
  }
  console.log(ok ? "Self-test: todo OK" : "Self-test: HAY FALLOS, revisar extractArticleSlugFromText");
  return ok;
}

async function run(apply: boolean) {
  const posts = await prisma.forumPost.findMany({
    where: { articleSlug: null },
    select: { id: true, title: true, content: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n=== ${apply ? "APLICANDO" : "DRY-RUN"} contra la base real ===`);
  console.log(`Posts sin articleSlug encontrados: ${posts.length}`);

  if (posts.length === 0) {
    console.log("No hay posts para migrar.");
    return;
  }

  const articles = await prisma.article.findMany({ select: { slug: true } });
  const knownSlugs = new Set(articles.map((a) => a.slug));

  let matched = 0;
  let skippedNoLink = 0;
  let skippedUnknownArticle = 0;

  for (const post of posts) {
    const candidate = extractArticleSlugFromText(post.content);

    if (!candidate) {
      skippedNoLink++;
      continue;
    }

    if (!knownSlugs.has(candidate)) {
      skippedUnknownArticle++;
      console.log(
        `  [omitido] post "${post.title}" (${post.id}): encontro slug "${candidate}" pero no existe ese articulo`
      );
      continue;
    }

    matched++;
    console.log(`  [${apply ? "SET" : "SETEARIA"}] post "${post.title}" (${post.id}) -> articleSlug="${candidate}"`);

    if (apply) {
      await prisma.forumPost.update({
        where: { id: post.id },
        data: { articleSlug: candidate },
      });
    }
  }

  console.log(
    `\nResumen: ${matched} con match, ${skippedNoLink} sin ningun link de articulo, ${skippedUnknownArticle} con link a un articulo inexistente.`
  );
}

async function main() {
  const apply = process.argv.includes("--apply");

  const selfTestOk = selfTest();
  if (!selfTestOk) {
    console.error("\nAbortando: el self-test de extraccion de slugs no pasa.");
    process.exit(1);
  }

  await run(apply);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

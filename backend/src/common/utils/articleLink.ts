const URL_REGEX = /https?:\/\/[^\s]+/g;
const ARTICLE_PATH_REGEX = /^\/articulos\/([^/?#]+)\/?$/;

export function extractArticleSlugFromText(text: string): string | null {
  const matches = text.match(URL_REGEX) || [];

  for (const raw of matches) {
    try {
      const url = new URL(raw);
      const match = url.pathname.match(ARTICLE_PATH_REGEX);
      if (match) return decodeURIComponent(match[1]);
    } catch {
      continue;
    }
  }

  return null;
}

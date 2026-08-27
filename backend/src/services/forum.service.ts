import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { extractArticleSlugFromText } from "../common/utils/articleLink";

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

async function resolveArticleSlug(content: string): Promise<string | null> {
  const candidate = extractArticleSlugFromText(content);
  if (!candidate) return null;

  const article = await prisma.article.findUnique({
    where: { slug: candidate },
    select: { slug: true },
  });

  return article ? article.slug : null;
}

/**
 * Attaches, per post, the oldest comment and total comment count in the same
 * findMany call (Prisma batches nested relations, no per-post query).
 */
function withFeedComments() {
  return {
    author: { select: authorSelect },
    comments: {
      take: 1,
      orderBy: { createdAt: "asc" as const },
      include: { author: { select: authorSelect } },
    },
    _count: { select: { comments: true } },
  };
}

async function attachMatchedComments<T extends { id: string; content: string; title: string }>(
  posts: T[],
  q: string
) {
  const needsMatch = posts.filter(
    (p) =>
      !p.title.toLowerCase().includes(q.toLowerCase()) &&
      !p.content.toLowerCase().includes(q.toLowerCase())
  );
  if (needsMatch.length === 0) return new Map<string, any>();

  const matches = await prisma.forumComment.findMany({
    where: {
      postId: { in: needsMatch.map((p) => p.id) },
      content: { contains: q, mode: "insensitive" },
    },
    orderBy: { createdAt: "asc" },
    include: { author: { select: authorSelect } },
    distinct: ["postId"],
  });

  return new Map(matches.map((c) => [c.postId, c]));
}

export async function listPosts(options: { onlyWithArticle?: boolean } = {}) {
  return prisma.forumPost.findMany({
    where: options.onlyWithArticle ? { articleSlug: { not: null } } : undefined,
    orderBy: { createdAt: "desc" },
    include: withFeedComments(),
  });
}

export async function getPost(id: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      author: { select: authorSelect },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect } },
      },
    },
  });

  if (!post) throw new ApiError(404, "Post not found");
  return post;
}

export async function getPostComments(postId: string) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  return prisma.forumComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: authorSelect } },
  });
}

/** Oldest post referencing this article slug is the canonical thread for it. */
export async function getCanonicalPostByArticleSlug(slug: string) {
  return prisma.forumPost.findFirst({
    where: { articleSlug: slug },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: authorSelect },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect } },
      },
    },
  });
}

export async function addCommentToArticle(slug: string, authorId: string, data: any) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) throw new ApiError(404, "Article not found");

  let post = await prisma.forumPost.findFirst({
    where: { articleSlug: slug },
    orderBy: { createdAt: "asc" },
  });

  if (!post) {
    post = await prisma.forumPost.create({
      data: {
        authorId,
        title: article.title,
        content: `Comentarios sobre "${article.title}"`,
        articleSlug: slug,
      },
    });
  }

  const comment = await prisma.forumComment.create({
    data: { ...data, postId: post.id, authorId },
    include: { author: { select: authorSelect } },
  });

  return { post, comment };
}

export async function createPost(authorId: string, data: any) {
  const articleSlug = await resolveArticleSlug(data.content);

  return prisma.forumPost.create({
    data: { ...data, authorId, articleSlug },
    include: { author: { select: authorSelect } },
  });
}

export async function createComment(postId: string, authorId: string, data: any) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  return prisma.forumComment.create({
    data: { ...data, postId, authorId },
    include: { author: { select: authorSelect } },
  });
}

export async function search(q: string, options: { onlyWithArticle?: boolean } = {}) {
  const posts = await prisma.forumPost.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
            {
              comments: {
                some: { content: { contains: q, mode: "insensitive" } },
              },
            },
          ],
        },
        ...(options.onlyWithArticle ? [{ articleSlug: { not: null } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: withFeedComments(),
  });

  const matchedByPostId = await attachMatchedComments(posts, q);

  return posts.map((post) => ({
    ...post,
    matchedComment: matchedByPostId.get(post.id) ?? null,
  }));
}

export async function updatePost(postId: string, userId: string, isAdmin: boolean, data: any) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  if (!isAdmin && post.authorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }

  const articleSlug =
    data.content !== undefined ? await resolveArticleSlug(data.content) : undefined;

  return prisma.forumPost.update({
    where: { id: postId },
    data: { ...data, ...(articleSlug !== undefined ? { articleSlug } : {}) },
    include: { author: { select: authorSelect } },
  });
}

export async function deletePost(postId: string, userId: string, isAdmin: boolean) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  if (!isAdmin && post.authorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }

  return prisma.forumPost.delete({ where: { id: postId } });
}

export async function deleteComment(commentId: string, userId: string, isAdmin: boolean) {
  const comment = await prisma.forumComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new ApiError(404, "Comment not found");

  if (!isAdmin && comment.authorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }

  return prisma.forumComment.delete({ where: { id: commentId } });
}

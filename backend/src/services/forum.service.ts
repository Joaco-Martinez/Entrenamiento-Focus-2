import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { extractArticleSlugFromText } from "../common/utils/articleLink";
import { cloudinary } from "../config/cloudinary";

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
 * Sube una nota de voz a Cloudinary (resource_type "video": así es como
 * Cloudinary maneja audio, no existe un tipo "audio" separado) y devuelve la
 * URL y duración reales que Cloudinary calculó — nunca se confía en un dato
 * de duración mandado por el cliente.
 */
async function uploadCommentAudio(
  file: Express.Multer.File | undefined
): Promise<{ audioUrl?: string; audioDuration?: number; audioPublicId?: string }> {
  if (!file) return {};

  const uploaded = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "foro/audios", resource_type: "video" },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  return {
    audioUrl: uploaded.secure_url,
    audioPublicId: uploaded.public_id,
    audioDuration:
      typeof uploaded.duration === "number" ? Math.round(uploaded.duration) : undefined,
  };
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

const WAVEFORM_BARS = 48;

/**
 * audioPeaks es puramente decorativo (la onda del reproductor) y lo calcula
 * el navegador al grabar — nunca se re-decodifica el audio acá. Solo se
 * sanea la forma: array de hasta 48 enteros 0-100.
 */
function parseAudioPeaks(raw: unknown): number[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, WAVEFORM_BARS)
      .map((v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0))));
  } catch {
    return [];
  }
}

async function buildCommentCreateData(data: any, file: Express.Multer.File | undefined) {
  const { audioUrl, audioDuration, audioPublicId } = await uploadCommentAudio(file);
  const content =
    typeof data.content === "string" && data.content.trim() ? data.content.trim() : null;

  if (!content && !audioUrl) {
    throw new ApiError(400, "El comentario no puede estar vacío: escribí algo o grabá un audio.");
  }

  return {
    content,
    audioUrl: audioUrl ?? null,
    audioPublicId: audioPublicId ?? null,
    audioDuration: audioDuration ?? null,
    audioPeaks: audioUrl ? parseAudioPeaks(data.audioPeaks) : [],
  };
}

export async function addCommentToArticle(
  slug: string,
  authorId: string,
  data: any,
  file?: Express.Multer.File
) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) throw new ApiError(404, "Article not found");

  // Se valida/sube el audio antes de tocar la base, para no dejar un post
  // canónico huérfano si el comentario termina siendo inválido.
  const commentData = await buildCommentCreateData(data, file);

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
    data: { ...commentData, postId: post.id, authorId },
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

export async function createComment(
  postId: string,
  authorId: string,
  data: any,
  file?: Express.Multer.File
) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  const commentData = await buildCommentCreateData(data, file);

  return prisma.forumComment.create({
    data: { ...commentData, postId, authorId },
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

/**
 * Best-effort: nunca tira. Un problema de red/credenciales con Cloudinary no
 * puede impedir borrar un post o comentario del foro — solo queda logueado.
 */
async function destroyCommentAudio(comment: { id: string; audioPublicId: string | null }) {
  if (!comment.audioPublicId) return;

  try {
    await cloudinary.uploader.destroy(comment.audioPublicId, { resource_type: "video" });
  } catch (err) {
    console.error(
      `No se pudo borrar de Cloudinary el audio del comentario ${comment.id} (public_id=${comment.audioPublicId}):`,
      err
    );
  }
}

export async function deletePost(postId: string, userId: string, isAdmin: boolean) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  if (!isAdmin && post.authorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }

  const commentsWithAudio = await prisma.forumComment.findMany({
    where: { postId, audioPublicId: { not: null } },
    select: { id: true, audioPublicId: true },
  });

  await Promise.all(commentsWithAudio.map((c) => destroyCommentAudio(c)));

  // ForumComment.post tiene onDelete: Cascade — borrar el post ya borra sus
  // comentarios en la base.
  return prisma.forumPost.delete({ where: { id: postId } });
}

export async function deleteComment(commentId: string, userId: string, isAdmin: boolean) {
  const comment = await prisma.forumComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new ApiError(404, "Comment not found");

  if (!isAdmin && comment.authorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }

  await destroyCommentAudio(comment);

  return prisma.forumComment.delete({ where: { id: commentId } });
}

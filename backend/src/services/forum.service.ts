import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

export async function listPosts() {
  return prisma.forumPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      _count: { select: { comments: true } },
    },
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

export async function createPost(authorId: string, data: any) {
  return prisma.forumPost.create({
    data: { ...data, authorId },
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

export async function search(q: string) {
  return prisma.forumPost.findMany({
    where: {
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
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: authorSelect } },
      },
    },
  });
}

export async function updatePost(postId: string, userId: string, isAdmin: boolean, data: any) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new ApiError(404, "Post not found");

  if (!isAdmin && post.authorId !== userId) {
    throw new ApiError(403, "No autorizado");
  }

  return prisma.forumPost.update({
    where: { id: postId },
    data,
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

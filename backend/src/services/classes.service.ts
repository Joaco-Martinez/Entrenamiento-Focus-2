import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { generateUniqueSlug } from "../common/utils/slug";
import { cloudinary } from "../config/cloudinary";
import * as bunnyService from "./bunny.service";

const publicSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  coverImageUrl: true,
  durationSeconds: true,
  arPrice: true,
  usdPrice: true,
  createdAt: true,
} as const;

export async function listPublic() {
  return prisma.videoClass.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: publicSelect,
  });
}

export async function getPublicBySlug(slug: string) {
  const item = await prisma.videoClass.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: publicSelect,
  });

  if (!item) throw new ApiError(404, "Clase no encontrada");
  return item;
}

export async function listAdmin() {
  return prisma.videoClass.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminById(id: string) {
  const item = await prisma.videoClass.findUnique({ where: { id } });
  if (!item) throw new ApiError(404, "Clase no encontrada");
  return item;
}

/**
 * Único lugar que decide si un usuario puede ver una clase comprada.
 * Nunca se resuelve en el frontend: se basa exclusivamente en si existe
 * un AccessGrant, que solo se crea cuando el webhook del proveedor de pago
 * confirma la compra (ver orders.service.markPaid).
 */
export async function getAccess(userId: string, slug: string) {
  const item = await prisma.videoClass.findUnique({ where: { slug } });
  if (!item) throw new ApiError(404, "Clase no encontrada");

  const grant = await prisma.accessGrant.findUnique({
    where: { userId_classId: { userId, classId: item.id } },
  });

  return { hasAccess: Boolean(grant) };
}

export async function create(data: any, createdById: string) {
  const slug = await generateUniqueSlug(
    data.title,
    async (slug) => Boolean(await prisma.videoClass.findUnique({ where: { slug } }))
  );

  return prisma.videoClass.create({
    data: { ...data, slug, createdById },
  });
}

export async function update(id: string, data: any) {
  await getAdminById(id);
  return prisma.videoClass.update({ where: { id }, data });
}

export async function remove(id: string) {
  const item = await getAdminById(id);

  if (item.bunnyVideoId) {
    await bunnyService.deleteVideo(item.bunnyVideoId);
  }

  if (item.coverImagePublicId) {
    await cloudinary.uploader.destroy(item.coverImagePublicId, {
      resource_type: "image",
    });
  }

  await prisma.videoClass.delete({ where: { id } });
}

export async function setCover(
  id: string,
  coverImageUrl: string,
  coverImagePublicId: string
) {
  const item = await getAdminById(id);

  if (item.coverImagePublicId) {
    await cloudinary.uploader.destroy(item.coverImagePublicId, {
      resource_type: "image",
    });
  }

  return prisma.videoClass.update({
    where: { id },
    data: { coverImageUrl, coverImagePublicId },
  });
}

export async function initVideoUpload(id: string) {
  const item = await getAdminById(id);

  if (item.bunnyVideoId) {
    await bunnyService.deleteVideo(item.bunnyVideoId);
  }

  const videoId = await bunnyService.createVideo(item.title);

  await prisma.videoClass.update({
    where: { id },
    data: { bunnyVideoId: videoId },
  });

  return bunnyService.generateTusSignature(videoId);
}

const BUNNY_STATUS_FINISHED = 4;

export async function getVideoStatus(id: string) {
  const item = await getAdminById(id);

  if (!item.bunnyVideoId) {
    return { status: null, message: "Todavía no se subió ningún video." };
  }

  const status = await bunnyService.getVideoStatus(item.bunnyVideoId);

  // Bunny es la única fuente de verdad para la duración: la tomamos apenas
  // termina de procesar el video, en vez de pedirla a mano en el form.
  if (
    status.status === BUNNY_STATUS_FINISHED &&
    status.length &&
    status.length !== item.durationSeconds
  ) {
    await prisma.videoClass.update({
      where: { id },
      data: { durationSeconds: status.length },
    });
  }

  return status;
}

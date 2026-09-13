import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { generateUniqueSlug } from "../common/utils/slug";
import { cloudinary } from "../config/cloudinary";
import * as bunnyService from "./bunny.service";
import * as ordersService from "./orders.service";

const BUNNY_STATUS_FINISHED = 4;

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
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: publicSelect,
  });
}

export async function getPublicBySlug(slug: string) {
  const item = await prisma.videoClass.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: publicSelect,
  });

  if (!item) throw new ApiError(404, "Clase no encontrada");
  return item;
}

export async function listAdmin() {
  return prisma.videoClass.findMany({
    where: { deletedAt: null },
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
 * un AccessGrant, que normalmente crea el webhook del proveedor de pago
 * (ver orders.service.markPaid) o el confirm-payment del redirect. A
 * propósito NO filtra por status: publicada o no, quien ya compró la clase
 * tiene que poder seguir accediendo. El status solo decide si la clase
 * aparece en el catálogo y si se puede comprar (ver listPublic/getPublicBySlug).
 *
 * Si no hay grant, antes de decir que no, intentamos reconciliar contra la
 * API del proveedor por si el webhook nunca llegó (red de seguridad, ver
 * orders.service.reconcilePendingClassOrders). Si el usuario nunca tuvo una
 * orden pendiente para esta clase, esto es un no-op rápido: no pega contra
 * ninguna API externa.
 *
 * Devuelve también el título: la página /ver lo necesita y, a diferencia de
 * getPublicBySlug, esta ruta no puede filtrar por PUBLISHED (rompería la
 * reproducción de compradores de una clase despublicada).
 */
export async function getAccess(userId: string, slug: string) {
  const item = await prisma.videoClass.findUnique({ where: { slug } });
  if (!item) throw new ApiError(404, "Clase no encontrada");

  let grant = await prisma.accessGrant.findUnique({
    where: { userId_classId: { userId, classId: item.id } },
  });

  if (!grant) {
    const reconciled = await ordersService.reconcilePendingClassOrders(userId, item.id);
    if (reconciled) {
      grant = await prisma.accessGrant.findUnique({
        where: { userId_classId: { userId, classId: item.id } },
      });
    }
  }

  return { hasAccess: Boolean(grant), title: item.title };
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

/**
 * El gate de si se puede borrar la fila de verdad NO es AccessGrant, es
 * OrderItem: OrderItem.classId y AccessGrant.classId apuntan a VideoClass con
 * ON DELETE SET NULL, pero OrderItem_product_or_class_check /
 * AccessGrant_product_or_class_check exigen que siempre haya exactamente uno
 * de productId/classId no nulo. Si existe aunque sea un OrderItem para esta
 * clase (comprada o no: una orden PENDING/CANCELLED que nunca llegó a pagarse
 * también cuenta), borrar la fila VideoClass hace que Postgres intente poner
 * ese classId en NULL y la fila queda con los dos campos en NULL: viola el
 * constraint y aborta toda la transacción (así se manifestaba el bug con
 * clases que tenían una compra de prueba pero ni un AccessGrant).
 *
 * Por eso hay dos caminos:
 * - Sin ningún OrderItem: nunca hubo ni un intento de compra, se puede borrar
 *   la fila de verdad (hard delete), como hacía este método originalmente.
 * - Con OrderItem (aunque buyersCount de AccessGrant sea 0): no se puede
 *   borrar la fila sin romper el constraint. Se archiva (deletedAt) en vez de
 *   borrarse: desaparece del catálogo público y del panel de admin, pero
 *   OrderItem/AccessGrant y el historial de ventas quedan intactos, apuntando
 *   a una fila que sigue existiendo.
 *
 * buyersCount (AccessGrant) se usa solo para el mensaje de confirmación: es
 * "cuánta gente tiene/tuvo acceso realmente", distinto de "hubo alguna vez una
 * orden". Si hay OrderItem pero buyersCount es 0 (orden que nunca se pagó), se
 * archiva igual — no hay forma de hacer hard delete sin arriesgarse a perder
 * ese registro de orden, y el criterio acordado es no tocar órdenes nunca.
 *
 * El borrado en Bunny/Cloudinary va DESPUÉS de que la base confirmó el
 * cambio (delete o archivado), nunca antes: si se hiciera al revés y el
 * cambio en la base fallara, el video ya estaría perdido con la clase
 * todavía viva y jugable en el catálogo. Con este orden, en el peor caso
 * (falla Bunny) lo que queda huérfano es un archivo en Bunny, nunca el
 * estado de la base.
 */
export async function remove(id: string, confirmed: boolean) {
  const item = await getAdminById(id);

  if (item.deletedAt) {
    return { requiresConfirmation: false as const };
  }

  const hasOrderHistory = (await prisma.orderItem.count({ where: { classId: id } })) > 0;

  if (hasOrderHistory) {
    const buyersCount = await prisma.accessGrant.count({ where: { classId: id } });

    if (!confirmed) {
      return { requiresConfirmation: true as const, buyersCount };
    }

    await prisma.$transaction([
      prisma.classWatchProgress.deleteMany({ where: { classId: id } }),
      prisma.videoClass.update({ where: { id }, data: { deletedAt: new Date() } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.classWatchProgress.deleteMany({ where: { classId: id } }),
      prisma.videoClass.delete({ where: { id } }),
    ]);
  }

  try {
    if (item.bunnyVideoId) {
      await bunnyService.deleteVideo(item.bunnyVideoId);
    }

    if (item.coverImagePublicId) {
      await cloudinary.uploader.destroy(item.coverImagePublicId, {
        resource_type: "image",
      });
    }
  } catch (err) {
    console.error(
      "La clase se borró/archivó en la base pero falló el borrado en Bunny/Cloudinary:",
      err
    );
    throw new ApiError(
      502,
      "La clase se eliminó, pero no se pudo borrar el video de Bunny o la portada. Borralos manualmente."
    );
  }

  return { requiresConfirmation: false as const };
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

/**
 * Punto único de verificación para reproducir. Se llama en cada intento de
 * arrancar o renovar la reproducción: siempre vuelve a chequear la compra
 * contra la base y recién ahí firma una URL de Bunny de vida corta. Nunca
 * confía en nada que venga del navegador más allá del id del usuario logueado
 * (sacado del JWT) y el slug de la clase.
 *
 * Tampoco filtra por status, por la misma razón que getAccess: si la clase se
 * despublica, quien ya la compró tiene que poder seguir reproduciéndola.
 *
 * deletedAt sí corta acá, y a propósito antes de tocar Bunny: una clase
 * archivada (ver remove) ya no tiene video en Bunny, así que sin este chequeo
 * temprano el intento de reproducir terminaría pegándole a la API de Bunny y
 * devolviendo un 404 genérico ("Video no encontrado en Bunny"), que es un
 * mensaje pensado para un admin, no para el comprador.
 */
export async function getPlaybackInfo(userId: string, slug: string) {
  const item = await prisma.videoClass.findUnique({ where: { slug } });
  if (!item) throw new ApiError(404, "Clase no encontrada");

  if (item.deletedAt) {
    throw new ApiError(410, "Esta clase ya no está disponible.");
  }

  let grant = await prisma.accessGrant.findUnique({
    where: { userId_classId: { userId, classId: item.id } },
  });

  if (!grant) {
    const reconciled = await ordersService.reconcilePendingClassOrders(userId, item.id);
    if (reconciled) {
      grant = await prisma.accessGrant.findUnique({
        where: { userId_classId: { userId, classId: item.id } },
      });
    }
  }

  if (!grant) throw new ApiError(403, "No compraste esta clase");

  if (!item.bunnyVideoId) {
    throw new ApiError(409, "Esta clase todavía no tiene un video cargado");
  }

  const bunnyStatus = await bunnyService.getVideoStatus(item.bunnyVideoId);
  if (bunnyStatus.status !== BUNNY_STATUS_FINISHED) {
    throw new ApiError(409, "El video todavía se está procesando");
  }

  // Watermark: se resuelve acá, con el id del usuario ya autenticado, nunca
  // con datos que pudiera mandar el cliente.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, lastName: true },
  });
  if (!user) throw new ApiError(404, "Usuario no encontrado");

  // Filtramos partes que por datos viejos/mal cargados coincidan con el email,
  // para no terminar mostrando el mail duplicado en la marca de agua.
  const emailLower = user.email.toLowerCase();
  const fullName = [user.firstName, user.lastName]
    .filter((part) => Boolean(part) && part!.toLowerCase() !== emailLower)
    .join(" ")
    .trim();

  const progress = await prisma.classWatchProgress.findUnique({
    where: { userId_classId: { userId, classId: item.id } },
  });

  const resumeFromSeconds = progress?.positionSeconds ?? 0;

  const { embedUrl, expiresAt } = bunnyService.generatePlaybackUrl(
    item.bunnyVideoId,
    resumeFromSeconds
  );

  return {
    embedUrl,
    expiresAt,
    resumeFromSeconds,
    watermark: {
      name: fullName || user.email,
      email: user.email,
    },
  };
}

export async function saveWatchProgress(
  userId: string,
  slug: string,
  positionSeconds: number
) {
  const item = await prisma.videoClass.findUnique({ where: { slug } });
  if (!item) throw new ApiError(404, "Clase no encontrada");

  const grant = await prisma.accessGrant.findUnique({
    where: { userId_classId: { userId, classId: item.id } },
  });
  if (!grant) throw new ApiError(403, "No compraste esta clase");

  const safePosition = Math.max(0, Math.floor(Number(positionSeconds) || 0));

  await prisma.classWatchProgress.upsert({
    where: { userId_classId: { userId, classId: item.id } },
    create: { userId, classId: item.id, positionSeconds: safePosition },
    update: { positionSeconds: safePosition },
  });

  return { ok: true };
}

import crypto from "crypto";
import { bunnyApi, BUNNY_TUS_ENDPOINT } from "../config/bunny";
import { env } from "../config/env";
import { ApiError } from "../common/errors/ApiError";

// Los videos son de hasta ~2 horas y varios GB: la subida TUS puede tardar
// mucho o cortarse y reanudarse horas después, así que la firma se deja
// vigente por 24hs en vez de la ventana corta que alcanzaría para un archivo chico.
const TUS_SIGNATURE_TTL_SECONDS = 24 * 60 * 60;

export async function createVideo(title: string) {
  const { data } = await bunnyApi.post("/videos", { title });
  return data.guid as string;
}

export async function deleteVideo(videoId: string) {
  try {
    await bunnyApi.delete(`/videos/${videoId}`);
  } catch (err: any) {
    // Si ya no existe en Bunny, no es un error bloqueante para nuestro flujo.
    if (err?.response?.status !== 404) throw err;
  }
}

export async function getVideoStatus(videoId: string) {
  try {
    const { data } = await bunnyApi.get(`/videos/${videoId}`);
    return {
      status: data.status,
      encodeProgress: data.encodeProgress ?? null,
      length: data.length ?? null,
      availableResolutions: data.availableResolutions ?? null,
    };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      throw new ApiError(404, "Video no encontrado en Bunny");
    }
    throw err;
  }
}

export function generateTusSignature(videoId: string) {
  const expire = Math.floor(Date.now() / 1000) + TUS_SIGNATURE_TTL_SECONDS;
  const libraryId = env.BUNNY_STREAM_LIBRARY_ID;

  const signature = crypto
    .createHash("sha256")
    .update(`${libraryId}${env.BUNNY_STREAM_API_KEY}${expire}${videoId}`)
    .digest("hex");

  return {
    endpoint: BUNNY_TUS_ENDPOINT,
    libraryId,
    videoId,
    signature,
    expire,
  };
}

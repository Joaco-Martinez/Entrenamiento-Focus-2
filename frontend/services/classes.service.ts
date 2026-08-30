import { apiFetch } from "@/lib/api";

export type ClassStatus = "DRAFT" | "PUBLISHED";

export type VideoClass = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bunnyVideoId?: string | null;
  durationSeconds?: number | null;
  arPrice: number;
  usdPrice: number;
  status: ClassStatus;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateClassDto = {
  title: string;
  description?: string;
  arPrice?: number;
  usdPrice?: number;
};

export type UpdateClassDto = Partial<CreateClassDto> & {
  status?: ClassStatus;
};

export type VideoUploadTicket = {
  endpoint: string;
  libraryId: string;
  videoId: string;
  signature: string;
  expire: number;
};

export type VideoStatus = {
  status: number | null;
  encodeProgress?: number | null;
  length?: number | null;
  availableResolutions?: string | null;
  message?: string;
};

export const classesService = {
  async getAll(): Promise<{ classes: VideoClass[] }> {
    return apiFetch(`/clases`);
  },

  async getBySlug(slug: string): Promise<{ class: VideoClass }> {
    return apiFetch(`/clases/${slug}`);
  },

  async adminList(): Promise<{ classes: VideoClass[] }> {
    return apiFetch(`/clases/admin/clases`);
  },

  async adminGet(id: string): Promise<{ class: VideoClass }> {
    return apiFetch(`/clases/admin/clases/${id}`);
  },

  async create(dto: CreateClassDto): Promise<{ class: VideoClass }> {
    return apiFetch(`/clases/admin/clases`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  async update(id: string, dto: UpdateClassDto): Promise<{ class: VideoClass }> {
    return apiFetch(`/clases/admin/clases/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  async remove(id: string): Promise<{ ok: boolean }> {
    return apiFetch(`/clases/admin/clases/${id}`, { method: "DELETE" });
  },

  async uploadCover(id: string, file: File): Promise<{ class: VideoClass }> {
    const form = new FormData();
    form.append("image", file);
    return apiFetch(`/clases/admin/clases/${id}/cover`, {
      method: "POST",
      body: form,
    });
  },

  async initVideoUpload(id: string): Promise<{ upload: VideoUploadTicket }> {
    return apiFetch(`/clases/admin/clases/${id}/video/init`, {
      method: "POST",
    });
  },

  async getVideoStatus(id: string): Promise<VideoStatus & { ok: boolean }> {
    return apiFetch(`/clases/admin/clases/${id}/video/status`);
  },

  async getAccess(slug: string): Promise<{ ok: boolean; hasAccess: boolean }> {
    return apiFetch(`/clases/${slug}/access`);
  },

  async getPlayback(slug: string): Promise<{
    ok: boolean;
    embedUrl: string;
    expiresAt: number;
    resumeFromSeconds: number;
    watermark: { name: string; email: string };
  }> {
    return apiFetch(`/clases/${slug}/playback`);
  },

  async saveProgress(slug: string, positionSeconds: number): Promise<{ ok: boolean }> {
    return apiFetch(`/clases/${slug}/progress`, {
      method: "POST",
      body: JSON.stringify({ positionSeconds }),
    });
  },
};

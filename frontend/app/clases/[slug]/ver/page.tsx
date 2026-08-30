"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { classesService, VideoClass } from "@/services/classes.service";
import ProtectedClassPlayer from "@/components/player/ProtectedClassPlayer";

export default function VerClasePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuth, loading: authLoading } = useAuth();

  const [item, setItem] = useState<VideoClass | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuth) {
      router.replace(`/login?redirect=/clases/${slug}/ver`);
      return;
    }

    const run = async () => {
      try {
        const [claseRes, accessRes] = await Promise.all([
          classesService.getBySlug(slug),
          classesService.getAccess(slug),
        ]);

        setItem(claseRes.class);
        setHasAccess(Boolean(accessRes.hasAccess));
      } catch (err: any) {
        setError(err?.message || "No se pudo verificar el acceso a la clase.");
        setHasAccess(false);
      }
    };

    run();
  }, [authLoading, isAuth, slug, router]);

  if (authLoading || (isAuth && hasAccess === null && !error)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] text-white/60">
        Verificando acceso...
      </div>
    );
  }

  if (!isAuth) return null;

  if (hasAccess === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070707] px-4 text-center text-white">
        <Lock className="h-10 w-10 text-white/40" />
        <p className="max-w-sm text-white/70">
          {error || "Todavía no compraste esta clase."}
        </p>
        <Link
          href={`/clases/${slug}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver detalle de la clase
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href={`/clases/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la clase
        </Link>

        <h1 className="text-2xl font-bold md:text-3xl">{item?.title}</h1>

        <ProtectedClassPlayer slug={slug} />
      </div>
    </div>
  );
}

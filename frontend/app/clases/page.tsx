"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clapperboard, Clock } from "lucide-react";
import { classesService, VideoClass } from "@/services/classes.service";

function formatUsd(value?: number | null) {
  if (!value) return null;
  return `US$${value.toLocaleString("en-US")}`;
}

function formatArs(value?: number | null) {
  if (!value) return null;
  return `$${value.toLocaleString("es-AR")}`;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function ClasesPage() {
  const [items, setItems] = useState<VideoClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setError(null);
      setLoading(true);

      try {
        const res = await classesService.getAll();
        setItems(Array.isArray(res?.classes) ? res.classes : []);
      } catch (err: any) {
        setError(err?.message || "No se pudieron cargar las clases.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <section className="bg-muted/20 px-4 py-20 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div className="space-y-5 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Clapperboard className="h-3.5 w-3.5" />
              Catálogo de clases
            </div>

            <h1 className="text-balance text-4xl font-bold md:text-6xl">
              Clases <span className="text-primary">de video</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
              Clases grabadas, a tu ritmo, sobre producción, mezcla y mastering.
            </p>

            <div className="mx-auto h-1 w-16 rounded-full bg-primary" />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[380px] animate-pulse rounded-3xl bg-card/40" />
              ))
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">Todavía no hay clases publicadas.</p>
            ) : (
              items.map((item, idx) => {
                const duration = formatDuration(item.durationSeconds);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.35 }}
                  >
                    <Link href={`/clases/${item.slug}`}>
                      <Card className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <div className="relative overflow-hidden rounded-2xl">
                          <div className="relative aspect-video w-full bg-black/30">
                            <Image
                              src={item.coverImageUrl || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />

                            {duration && (
                              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                <Clock className="h-3 w-3" />
                                {duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          <h3 className="line-clamp-2 text-xl font-bold leading-tight">
                            {item.title}
                          </h3>

                          {item.description ? (
                            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex flex-col">
                              <span className="text-2xl font-extrabold text-primary">
                                {formatUsd(item.usdPrice) ?? formatArs(item.arPrice)}
                              </span>
                              {formatUsd(item.usdPrice) && formatArs(item.arPrice) ? (
                                <span className="text-xs text-muted-foreground">
                                  {formatArs(item.arPrice)}
                                </span>
                              ) : null}
                            </div>

                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                              Ver más
                              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

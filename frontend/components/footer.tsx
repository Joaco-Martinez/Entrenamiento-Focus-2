"use client";

import Link from "next/link";
import { Instagram, Youtube, Music2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* =========================
              MARCA
          ========================= */}
          <div>
            <h2 className="text-lg font-semibold text-[#D4AF37]">
              Entrenamiento Focus
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Plataforma de formación para productores musicales.
              Aprendé, conectá y llevá tu sonido al siguiente nivel.
            </p>

            <div className="mt-4 flex gap-4">
              <a href="https://www.tiktok.com/@entrenamientofocus?lang=es-419" target="_blank" className="hover:text-[#D4AF37] transition">
                                <Music2 size={18} />

              </a>
            </div>
          </div>

          {/* =========================
              PRODUCTOR 1
          ========================= */}
          <div>
            <h3 className="text-sm font-semibold text-white">Matias Ledesma</h3>
            <p className="mt-2 text-sm text-white/60">
              Ing. En Mezcla y Mastering.
            </p>

            <div className="mt-4 flex gap-4">
              <a href="https://www.instagram.com/mati.mixer/" target="_blank" className="hover:text-[#D4AF37] transition">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@mati.mixer?lang=es-419" target="_blank" className="hover:text-[#D4AF37] transition">
                <Music2 size={18} />
              </a>
            </div>
          </div>

          {/* =========================
              PRODUCTOR 2
          ========================= */}
          <div>
            <h3 className="text-sm font-semibold text-white">Franco Cano</h3>
            <p className="mt-2 text-sm text-white/60">
              Tecnico en grabación y productor musical.
            </p>

            <div className="mt-4 flex gap-4">
              <a href="https://www.instagram.com/knnoknno/" target="_blank" className="hover:text-[#D4AF37] transition">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@knnoofficial" target="_blank" className="hover:text-[#D4AF37] transition">
                <Music2 size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* =========================
            LINEA INFERIOR
        ========================= */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>
            © {new Date().getFullYear()} Entrenamiento Focus. Todos los derechos reservados.
          </p>

          <div className="flex gap-6">
            <Link href="/recursos" className="hover:text-white transition">
              Productos
            </Link>
            <Link href="/Mentoria" className="hover:text-white transition">
              Mentoria
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
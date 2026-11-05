"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clothingService } from "@/services/clothing.service";

export default function ClothingOwnerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    clothingService.access()
      .then(() => {
        if (active) setAuthorized(true);
      })
      .catch(() => {
        if (active) router.replace("/admin");
      });
    return () => { active = false; };
  }, [router]);

  if (!authorized) {
    return (
      <div className="grid min-h-56 place-items-center text-sm text-white/50">
        Verificando acceso...
      </div>
    );
  }

  return <>{children}</>;
}

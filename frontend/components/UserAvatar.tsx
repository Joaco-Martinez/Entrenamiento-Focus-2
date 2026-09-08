"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/**
 * Círculo de avatar del foro: muestra la foto subida por el usuario, o su
 * inicial si todavía no subió una. Nunca queda un ícono roto.
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
  className,
}: {
  name: string
  avatarUrl?: string | null
  size?: number
  className?: string
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "U"

  return (
    <Avatar
      className={cn("border border-[#a67c27]/20 bg-[#f4ecdf]", className)}
      style={{ width: size, height: size }}
    >
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
      <AvatarFallback
        className="bg-[#f4ecdf] font-semibold text-[#a67c27]"
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}

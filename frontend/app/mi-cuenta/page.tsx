"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { usersService } from "@/services/users.service"
import { UserAvatar } from "@/components/UserAvatar"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export default function MiCuentaPage() {
  const router = useRouter()
  const { user, loading, isAuth, fullName, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!isAuth) router.replace("/login?redirect=/mi-cuenta")
  }, [loading, isAuth, router])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displayName = fullName || user?.email || "Usuario"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)
    setSuccess(false)

    if (!file) return

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Formato no soportado. Usá una imagen JPG, PNG, WEBP o GIF.")
      e.target.value = ""
      return
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setError("La imagen es demasiado pesada (máximo 5MB).")
      e.target.value = ""
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      await usersService.uploadAvatar(selectedFile)
      await refreshUser()
      setSuccess(true)
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (e: any) {
      setError(e?.message || "No se pudo subir la foto. Probá de nuevo.")
    } finally {
      setUploading(false)
    }
  }

  const handleCancelSelection = () => {
    setSelectedFile(null)
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (loading || !isAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b0b0c] text-white">
        <p className="text-white/70">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="mt-16 min-h-screen bg-[#0b0b0c] text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-bold">
              Mi cuenta <span className="text-primary">Focus</span>
            </p>
            <p className="text-xs text-white/60">Tu foto de perfil y tus datos</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-bold">Foto de perfil</h1>
          <p className="mt-1 text-sm text-white/60">
            Se muestra circular junto a tu nombre cuando participás en el foro. Si no
            subís una, se muestra tu inicial.
          </p>

          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row">
            <UserAvatar
              name={displayName}
              avatarUrl={previewUrl || user?.avatarUrl}
              size={112}
            />

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07] disabled:opacity-60"
                >
                  Elegir foto
                </button>

                {selectedFile && (
                  <>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={uploading}
                      className="rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm text-primary hover:bg-primary/25 disabled:opacity-60"
                    >
                      {uploading ? "Subiendo..." : "Guardar foto"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelSelection}
                      disabled={uploading}
                      className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm text-white/70 hover:bg-white/[0.04] disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <p className="text-xs text-white/45">
                JPG, PNG, WEBP o GIF · hasta 5MB. Se recorta automáticamente a cuadrado.
              </p>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  Foto actualizada correctamente.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold">Datos de la cuenta</h2>
          <div className="mt-3 space-y-1 text-sm text-white/70">
            <p>Nombre: {fullName || "—"}</p>
            <p>Email: {user?.email}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

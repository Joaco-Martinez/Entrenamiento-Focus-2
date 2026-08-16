"use client"

export default function WhatsAppButton() {
  const url = "https://wa.link/z356e3"

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)]"
    >
      {/* glow suave */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/30 blur-md opacity-0 transition group-hover:opacity-100" />

      {/* ICONO CORREGIDO */}
      <svg
        viewBox="0 0 24 24"
        className="relative h-7 w-7 fill-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.52 3.48A11.78 11.78 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.67a11.83 11.83 0 0 0 5.66 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.14-3.41-8.43zM12.06 21.3h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.79.99 1.01-3.69-.22-.38a9.4 9.4 0 0 1-1.45-5.02c0-5.21 4.24-9.45 9.45-9.45 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.77 6.67c0 5.21-4.24 9.45-9.44 9.45zm5.2-7.08c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.89 1.09-.17.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.37-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.12-.12.28-.31.42-.47.14-.17.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48h-.55c-.19 0-.5.07-.76.35-.26.28-1 1-1 2.43 0 1.43 1.03 2.81 1.17 3 .14.19 2.02 3.08 4.9 4.32.68.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.88-1.32.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.55-.33z"/>
      </svg>
    </a>
  )
}
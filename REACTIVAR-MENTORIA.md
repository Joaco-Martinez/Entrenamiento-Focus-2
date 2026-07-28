# Cómo reactivar la sección de Mentoría

La mentoría se desactivó solo de la navegación y la home. El sistema de pago
(Paypal y Mercado Pago), la página `/mentoria` y `/entrenamiento-focus`
siguen intactos en el código. Para volver a mostrarla, pegá esto en Claude Code:

```
Archivo: frontend/components/navbar.tsx

En el array navItems, agregar de nuevo la línea de Mentoria, quedando:

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/entrenamiento-focus", label: "Mentoria" },
  { href: "/servicios", label: "Servicios" },
  { href: "/recursos", label: "Productos" },
]

Archivo: frontend/app/page.tsx

En el div de los botones (el que hoy tiene Servicios y Productos), agregar
de nuevo el botón de Mentoría como primer elemento, con el mismo estilo que
los otros dos:

<Link
  href="/entrenamiento-focus"
  className="group w-full max-w-[360px] rounded-xl border border-[#c8a84b]/30 bg-[#111110] px-14 py-5 text-center transition hover:bg-[#c8a84b] sm:w-auto"
>
  <span className="text-[16px] font-bold text-[#f0ede6] transition group-hover:text-[#111110]">
    Mentoría →
  </span>
</Link>

No tocar el resto de los archivos.
```

Después, para publicar:

```
git add -A
git commit -m "Reactivar sección de mentoría"
git push origin master
```

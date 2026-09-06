"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// react-markdown pasa a los componentes el nodo ya convertido a hast (HTML
// AST), no el mdast original: un link es {type:"element", tagName:"a",
// properties:{href}}, no {type:"link", url}. Un párrafo con un único link
// adentro (nada de texto alrededor) se interpreta como botón/CTA destacado,
// no como link de texto corriente. Un párrafo con una única imagen adentro
// se arma como <figure> con epígrafe opcional (el "title" del markdown de
// imagen, vía properties.title en hast).
// Marcador de alineación de párrafo: texto plano literal al principio del
// párrafo (ej. "[align:center] Texto..."), nunca HTML — así seguimos sin
// necesitar rehype-raw. El editor del admin lo inserta/saca solo. Sin
// marcador = izquierda (default), no cambia nada de lo ya escrito.
const ALIGN_PREFIX = /^\[align:(center|right)\]\s?/

function isSoleElement(node: any, tagName: string) {
  const meaningfulChildren = (node?.children ?? []).filter(
    (child: any) => !(child.type === "text" && !child.value?.trim())
  )
  if (meaningfulChildren.length !== 1) return null
  const only = meaningfulChildren[0]
  return only?.type === "element" && only.tagName === tagName ? only : null
}

function Paragraph({ node, children }: any) {
  const link = isSoleElement(node, "a")
  if (link) {
    const href = link.properties?.href as string
    const label = link.children?.[0]?.value ?? href

    return (
      <div className="my-8 flex justify-center">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#a67c27] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#8f6a20]"
        >
          {label}
        </a>
      </div>
    )
  }

  const image = isSoleElement(node, "img")
  if (image) {
    const { src, alt, title } = image.properties ?? {}

    return (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          className="w-full rounded-2xl border border-[#2a2620]/10"
        />
        {title && (
          <figcaption className="mt-2 text-center text-sm text-[#6b6153]">{title}</figcaption>
        )}
      </figure>
    )
  }

  let align: "center" | "right" | null = null
  let renderedChildren = children

  if (Array.isArray(children) && typeof children[0] === "string") {
    const match = children[0].match(ALIGN_PREFIX)
    if (match) {
      align = match[1] as "center" | "right"
      const stripped = children[0].slice(match[0].length)
      renderedChildren = stripped ? [stripped, ...children.slice(1)] : children.slice(1)
    }
  } else if (typeof children === "string") {
    const match = children.match(ALIGN_PREFIX)
    if (match) {
      align = match[1] as "center" | "right"
      renderedChildren = children.slice(match[0].length)
    }
  }

  const alignClass = align === "center" ? " text-center" : align === "right" ? " text-right" : ""

  return <p className={`whitespace-pre-line${alignClass}`}>{renderedChildren}</p>
}

export function ArticleMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: Paragraph,
        h2: ({ children }) => (
          <h2 className="mt-10 text-2xl font-bold text-[#2a2620] md:text-3xl">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-8 text-xl font-bold text-[#2a2620] md:text-2xl">{children}</h3>
        ),
        strong: ({ children }) => <strong className="font-bold text-[#2a2620]">{children}</strong>,
        ul: ({ children }) => <ul className="ml-6 list-disc space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="ml-6 list-decimal space-y-2">{children}</ol>,
        li: ({ children }) => <li className="leading-8">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#a67c27] underline decoration-[#a67c27]/40 underline-offset-4 hover:decoration-[#a67c27]"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

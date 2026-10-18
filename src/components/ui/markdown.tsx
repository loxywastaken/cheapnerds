import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAllowedImageRef } from "@/lib/image-ref";
import { cn } from "@/lib/utils";

const components: Components = {
  a({ href, children }) {
    const safe = href && /^(https?:|mailto:|\/|#)/.test(href) ? href : undefined;
    const external = safe?.startsWith("http");
    return (
      <a href={safe} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (typeof src !== "string" || !isAllowedImageRef(src)) return null;
    // eslint-disable-next-line @next/next/no-img-element -- inline content images have unknown dimensions
    return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" className="h-auto w-full" />;
  },
  h1: ({ children }) => <h2>{children}</h2>,
};

/** Renders admin-authored Markdown. Raw HTML is never rendered (react-markdown escapes it). */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-cn", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}

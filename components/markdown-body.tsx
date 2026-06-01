import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import GithubSlugger from "github-slugger";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { splitMarkdownSections } from "@/lib/markdown";

type MarkdownBodyProps = {
  content: string;
};

function nodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(nodeText).join("");
  }

  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as { children?: ReactNode };

    return nodeText(props.children);
  }

  return "";
}

export function MarkdownBody({ content }: MarkdownBodyProps) {
  const slugger = new GithubSlugger();
  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1 {...props} id={slugger.slug(nodeText(children))}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...props} id={slugger.slug(nodeText(children))}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} id={slugger.slug(nodeText(children))}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 {...props} id={slugger.slug(nodeText(children))}>
        {children}
      </h4>
    ),
    table: ({ children, ...props }) => (
      <div className="markdown-table-wrap">
        <table {...props}>{children}</table>
      </div>
    )
  };

  return (
    <div className="markdown-body">
      {splitMarkdownSections(content).map((section, index) => (
        <section
          className={section.highlight ? "markdown-section changelog-section" : "markdown-section"}
          key={index}
        >
          <ReactMarkdown
            components={components}
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {section.content}
          </ReactMarkdown>
        </section>
      ))}
    </div>
  );
}

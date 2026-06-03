import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import GithubSlugger from "github-slugger";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { CopyableText } from "@/components/copyable-text";
import { JsonCodeBlock } from "@/components/json-code-block";
import { splitMarkdownSections } from "@/lib/markdown";
import type { Messages } from "@/lib/messages";

type MarkdownBodyProps = {
  content: string;
  labels: Messages["components"]["copy"];
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

function codeLanguage(children: ReactNode) {
  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as { className?: string };

    return props.className?.match(/language-(\w+)/)?.[1];
  }

  return undefined;
}

const NON_COPYABLE_TABLE_VALUES = new Set([
  "array",
  "boolean",
  "double",
  "false",
  "float",
  "integer",
  "null",
  "number",
  "object",
  "string",
  "true"
]);

function endpointParts(text: string) {
  return text.trim().match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\/\S+)$/);
}

function isCopyableTableValue(value: string) {
  const text = value.trim();

  if (!text || text.length > 80 || /\s/.test(text) || NON_COPYABLE_TABLE_VALUES.has(text.toLowerCase())) {
    return false;
  }

  return (
    /^[A-Z][A-Z0-9_]*$/.test(text) ||
    /^[a-z][a-zA-Z0-9_]*(?:\[\])?(?:\.[a-zA-Z0-9_]+(?:\[\])?)*$/.test(text) ||
    /^\/[A-Za-z0-9_./{}:-]+\/?$/.test(text)
  );
}

function copyableTrailingToken(children: ReactNode, label: string, title: string) {
  const text = nodeText(children);
  const match = text.match(/^(.+\s)([a-z][a-zA-Z0-9_]*(?:\[\])?(?:\.[a-zA-Z0-9_]+(?:\[\])?)*)$/);

  if (!match || !isCopyableTableValue(match[2])) {
    return children;
  }

  return (
    <>
      {match[1]}
      <CopyableText className="copy-token heading-copy-token" label={label} title={title} value={match[2]}>
        {match[2]}
      </CopyableText>
    </>
  );
}

export function MarkdownBody({ content, labels }: MarkdownBodyProps) {
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
        {copyableTrailingToken(children, labels.copyField, labels.clickToCopy)}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 {...props} id={slugger.slug(nodeText(children))}>
        {copyableTrailingToken(children, labels.copyField, labels.clickToCopy)}
      </h4>
    ),
    p: ({ children, ...props }) => {
      const text = nodeText(children);
      const match = endpointParts(text);

      if (match) {
        const [, method, path] = match;

        return (
          <p {...props} className="endpoint-line">
            <span className="endpoint-method">{method}</span>{" "}
            <CopyableText className="copy-token endpoint-path" label={labels.copyEndpoint} title={labels.clickToCopy} value={path}>
              {path}
            </CopyableText>
          </p>
        );
      }

      return <p {...props}>{children}</p>;
    },
    pre: ({ children, ...props }) => {
      const code = nodeText(children).replace(/\n$/, "");

      if (codeLanguage(children) === "json") {
        return <JsonCodeBlock code={code} labels={labels} />;
      }

      return <pre {...props}>{children}</pre>;
    },
    table: ({ children, ...props }) => (
      <div className="markdown-table-wrap">
        <table {...props}>{children}</table>
      </div>
    ),
    td: ({ children, ...props }) => {
      const text = nodeText(children);

      return (
        <td {...props}>
          {isCopyableTableValue(text) ? (
            <CopyableText label={labels.copyText} title={labels.clickToCopy} value={text.trim()}>
              {children}
            </CopyableText>
          ) : (
            children
          )}
        </td>
      );
    }
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

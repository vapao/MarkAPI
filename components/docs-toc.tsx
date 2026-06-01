import type { TocItem } from "@/lib/markdown";

type DocsTocProps = {
  items: TocItem[];
};

export function DocsToc({ items }: DocsTocProps) {
  if (items.length === 0) {
    return <p className="empty-text">当前文档没有二级或三级标题。</p>;
  }

  return (
    <nav aria-label="目录" className="toc-list">
      {items.map((item) => (
        <a className={item.level === 3 ? "toc-item toc-item-nested" : "toc-item"} href={`#${item.id}`} key={item.id}>
          {item.text}
        </a>
      ))}
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

type DocsTocProps = {
  collapsible?: boolean;
  items: TocItem[];
};

export function DocsToc({ collapsible = false, items }: DocsTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isCompact, setIsCompact] = useState(false);
  const [expandedParentId, setExpandedParentId] = useState("");

  const itemsWithParent = items.map((item) => {
    return {
      ...item,
      parentId: item.depth === 1 ? item.id : findParentId(items, item.id)
    };
  });
  const activeItem = itemsWithParent.find((item) => item.id === activeId);
  const activeVisibleId =
    isCompact && activeItem?.depth === 2 ? activeItem.parentId : activeId;
  const hasNestedItems = items.some((item) => item.depth === 2);
  const showToggle = collapsible && hasNestedItems;
  const visibleItems = itemsWithParent.filter((item) => {
    if (!isCompact || item.depth === 1) {
      return true;
    }

    return item.parentId === expandedParentId;
  });

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      return;
    }

    const docsContent = document.querySelector<HTMLElement>(".docs-content");
    const root =
      docsContent &&
      getComputedStyle(docsContent).overflowY === "auto" &&
      docsContent.scrollHeight > docsContent.clientHeight
        ? docsContent
        : null;
    const scrollTarget = root ?? window;
    let animationFrame = 0;
    const queueActiveUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const rootTop = root ? root.getBoundingClientRect().top : 0;
        const scrollMarginTop = Number.parseFloat(getComputedStyle(headings[0]).scrollMarginTop) || 0;
        const activationTop = rootTop + scrollMarginTop + 16;
        const activeHeading =
          headings.filter((heading) => heading.getBoundingClientRect().top <= activationTop).at(-1) ??
          headings[0];

        setActiveId(activeHeading.id);
      });
    };

    scrollTarget.addEventListener("scroll", queueActiveUpdate, { passive: true });
    window.addEventListener("resize", queueActiveUpdate);
    queueActiveUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      scrollTarget.removeEventListener("scroll", queueActiveUpdate);
      window.removeEventListener("resize", queueActiveUpdate);
    };
  }, [items]);

  function handleToggleCompact() {
    if (isCompact) {
      setIsCompact(false);
      return;
    }

    setExpandedParentId("");
    setIsCompact(true);
  }

  if (items.length === 0) {
    return (
      <>
        {collapsible ? (
          <div className="toc-heading">
            <h2>目录</h2>
          </div>
        ) : null}
        <p className="empty-text">当前文档没有二级或三级标题。</p>
      </>
    );
  }

  return (
    <>
      {collapsible ? (
        <div className="toc-heading">
          <h2>目录</h2>
          {showToggle ? (
            <button
              aria-label={isCompact ? "展开全部二级目录" : "只显示一级目录"}
              className={`toc-toggle${isCompact ? " toc-toggle-active" : ""}`}
              title={isCompact ? "展开全部二级目录" : "只显示一级目录"}
              type="button"
              onClick={handleToggleCompact}
            >
              <span aria-hidden="true" className="toc-toggle-mark" />
            </button>
          ) : null}
        </div>
      ) : null}
      <nav aria-label="目录" className="toc-list">
        {visibleItems.map((item) => {
          const className = [
            "toc-item",
            item.depth === 2 ? "toc-item-nested" : "",
            item.id === activeVisibleId ? "toc-item-active" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <a
              aria-current={item.id === activeVisibleId ? "location" : undefined}
              className={className}
              href={`#${item.id}`}
              key={item.id}
              onClick={() => {
                setActiveId(item.id);

                if (isCompact && item.depth === 1) {
                  setExpandedParentId(item.id);
                }
              }}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </>
  );
}

function findParentId(items: TocItem[], itemId: string) {
  const itemIndex = items.findIndex((item) => item.id === itemId);

  for (let index = itemIndex; index >= 0; index -= 1) {
    if (items[index]?.depth === 1) {
      return items[index].id;
    }
  }

  return "";
}

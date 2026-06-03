"use client";

import { useEffect, useState } from "react";

const HIT_SELECTOR = "mark.docs-search-hit";
const SEARCH_DELAY_MS = 600;
const SMOOTH_SCROLL_DISTANCE_RATIO = 1;

function clearHighlights() {
  for (const mark of document.querySelectorAll<HTMLElement>(HIT_SELECTOR)) {
    const parent = mark.parentNode;

    if (!parent) {
      continue;
    }

    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    parent.normalize();
  }
}

function highlightText(query: string) {
  const body = document.querySelector<HTMLElement>(".markdown-body");

  if (!body) {
    return [];
  }

  const lowerQuery = query.toLocaleLowerCase();
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent ?? "";
      const parent = node.parentElement;

      if (!parent || !text.trim() || parent.closest(HIT_SELECTOR)) {
        return NodeFilter.FILTER_REJECT;
      }

      return text.toLocaleLowerCase().includes(lowerQuery)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const textNodes: Text[] = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? "";
    const lowerText = text.toLocaleLowerCase();
    const fragment = document.createDocumentFragment();
    let start = 0;
    let index = lowerText.indexOf(lowerQuery);

    while (index >= 0) {
      if (index > start) {
        fragment.appendChild(document.createTextNode(text.slice(start, index)));
      }

      const mark = document.createElement("mark");
      mark.className = "docs-search-hit";
      mark.textContent = text.slice(index, index + query.length);
      fragment.appendChild(mark);

      start = index + query.length;
      index = lowerText.indexOf(lowerQuery, start);
    }

    if (start < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(start)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  return Array.from(document.querySelectorAll<HTMLElement>(HIT_SELECTOR));
}

function activateHit(index: number) {
  const hits = Array.from(document.querySelectorAll<HTMLElement>(HIT_SELECTOR));
  const hit = hits[index];

  for (const item of hits) {
    item.classList.remove("docs-search-hit-active");
  }

  if (hit) {
    hit.classList.add("docs-search-hit-active");
    const docsContent = document.querySelector<HTMLElement>(".docs-content");
    const scrollRoot =
      docsContent &&
      getComputedStyle(docsContent).overflowY === "auto" &&
      docsContent.scrollHeight > docsContent.clientHeight
        ? docsContent
        : null;
    const rootRect = scrollRoot?.getBoundingClientRect();
    const rootTop = rootRect?.top ?? 0;
    const rootHeight = scrollRoot?.clientHeight ?? window.innerHeight;
    const hitCenter = hit.getBoundingClientRect().top + hit.offsetHeight / 2;
    const viewportCenter = rootTop + rootHeight / 2;
    const distance = Math.abs(hitCenter - viewportCenter);
    const behavior = distance <= rootHeight * SMOOTH_SCROLL_DISTANCE_RATIO ? "smooth" : "auto";

    hit.scrollIntoView({ block: "center", behavior });
  }
}

type DocsSearchProps = {
  labels: {
    clear: string;
    inlineHint: string;
    label: string;
    noMatches: string;
    placeholder: string;
    shortcutTitle: string;
  };
};

export function DocsSearch({ labels }: DocsSearchProps) {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const trimmedQuery = query.trim();
  const hasMatches = matchCount > 0;
  const canMoveBetweenHits = matchCount > 1;
  const shouldShowCount = Boolean(trimmedQuery) && !isSearchPending;

  useEffect(() => {
    clearHighlights();

    if (!trimmedQuery) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const hits = highlightText(trimmedQuery);

      setCurrentIndex(0);
      setMatchCount(hits.length);
      setIsSearchPending(false);

      if (hits.length > 0) {
        activateHit(0);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
      clearHighlights();
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (!canMoveBetweenHits) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (event.key !== "ArrowDown" && event.key !== "ArrowUp")
      ) {
        return;
      }

      const target = event.target;

      if (target instanceof HTMLElement && !target.classList.contains("docs-search-input")) {
        const tagName = target.tagName;

        if (target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
          return;
        }
      }

      event.preventDefault();
      const nextIndex = event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
      const normalizedIndex = (nextIndex + matchCount) % matchCount;

      setCurrentIndex(normalizedIndex);
      activateHit(normalizedIndex);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canMoveBetweenHits, currentIndex, matchCount]);

  function goToHit(nextIndex: number) {
    if (!hasMatches) {
      return;
    }

    const normalizedIndex = (nextIndex + matchCount) % matchCount;

    setCurrentIndex(normalizedIndex);
    activateHit(normalizedIndex);
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setCurrentIndex(0);
    setMatchCount(0);
    setIsSearchPending(Boolean(nextQuery.trim()));
    clearHighlights();
  }

  return (
    <div className="docs-search" role="search">
      <span className="docs-search-field">
        <input
          aria-label={labels.label}
          aria-keyshortcuts="ArrowDown ArrowUp"
          className="docs-search-input"
          placeholder={labels.placeholder}
          title={canMoveBetweenHits ? labels.shortcutTitle : undefined}
          type="search"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              goToHit(currentIndex + (event.shiftKey ? -1 : 1));
            }

            if (event.key === "Escape") {
              updateQuery("");
            }
          }}
        />
        <span
          className={canMoveBetweenHits ? "docs-search-inline-hint" : "docs-search-inline-hint docs-search-hint-hidden"}
          aria-hidden={!canMoveBetweenHits}
        >
          {labels.inlineHint}
        </span>
        {query ? (
          <button
            aria-label={labels.clear}
            className="docs-search-clear"
            type="button"
            onClick={() => updateQuery("")}
          >
            ×
          </button>
        ) : null}
      </span>
      <span
        className={shouldShowCount ? "docs-search-count" : "docs-search-count docs-search-count-hidden"}
        aria-live="polite"
      >
        {shouldShowCount ? (hasMatches ? `${currentIndex + 1}/${matchCount}` : labels.noMatches) : ""}
      </span>
    </div>
  );
}

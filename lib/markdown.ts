import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};

export type MarkdownSection = {
  content: string;
  highlight: boolean;
};

const HEADING_PATTERN = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE_PATTERN = /^\s*(```|~~~)/;

export function plainHeadingText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/~~/g, "")
    .trim();
}

export function extractToc(content: string) {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inFence = false;

  for (const line of content.split(/\r?\n/)) {
    if (FENCE_PATTERN.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const match = line.match(HEADING_PATTERN);

    if (!match) {
      continue;
    }

    const level = match[1].length;
    const text = plainHeadingText(match[2]);
    const id = slugger.slug(text);

    if (level === 2 || level === 3) {
      toc.push({ id, level, text });
    }
  }

  return toc;
}

export function splitMarkdownSections(content: string) {
  const sections: MarkdownSection[] = [];
  let lines: string[] = [];
  let highlight = false;
  let inFence = false;

  for (const line of content.split(/\r?\n/)) {
    if (FENCE_PATTERN.test(line)) {
      inFence = !inFence;
    }

    const match = inFence ? null : line.match(/^##\s+(.+?)\s*#*\s*$/);

    if (match && lines.length > 0) {
      sections.push({ content: lines.join("\n"), highlight });
      lines = [];
      highlight = plainHeadingText(match[1]) === "变更记录";
    } else if (match) {
      highlight = plainHeadingText(match[1]) === "变更记录";
    }

    lines.push(line);
  }

  if (lines.length > 0) {
    sections.push({ content: lines.join("\n"), highlight });
  }

  return sections;
}

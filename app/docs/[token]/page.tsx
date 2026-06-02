import { notFound } from "next/navigation";
import { DocsToc } from "@/components/docs-toc";
import { DocsProjectSwitcher } from "@/components/docs-project-switcher";
import { DocsSearch } from "@/components/docs-search";
import { MarkdownBody } from "@/components/markdown-body";
import { VersionSelect } from "@/components/version-select";
import { formatDateTime } from "@/lib/format";
import { extractToc } from "@/lib/markdown";
import { prisma } from "@/lib/prisma";

type DocsPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    version?: string;
  }>;
};

export default async function DocsPage({ params, searchParams }: DocsPageProps) {
  const { token } = await params;
  const { version } = await searchParams;
  const project = await prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      versions: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const currentVersion = version
    ? project.versions.find((item) => item.id === Number(version))
    : project.versions[0];

  if (version && !currentVersion) {
    notFound();
  }

  return (
    <div className="docs-page">
      <header className="docs-header">
        <div className="docs-title">
          <p>MarkAPI</p>
          <DocsProjectSwitcher
            key={project.shareToken}
            currentProject={{
              token: project.shareToken,
              name: project.name
            }}
          />
        </div>
        {currentVersion ? <DocsSearch key={`search-${currentVersion.id}`} /> : null}
        <div className="docs-header-controls">
          {currentVersion ? (
            <VersionSelect
              key={currentVersion.id}
              currentVersionId={currentVersion.id}
              token={project.shareToken}
              versions={project.versions.map((item) => ({
                id: item.id,
                label: formatDateTime(item.createdAt)
              }))}
            />
          ) : null}
        </div>
      </header>

      {currentVersion ? (
        <>
          <div className="mobile-toc">
            <details>
              <summary>目录</summary>
              <DocsToc items={extractToc(currentVersion.content)} />
            </details>
          </div>
          <div className="docs-shell">
            <aside className="docs-sidebar">
              <DocsToc collapsible items={extractToc(currentVersion.content)} />
            </aside>
            <main className="docs-content">
              <div className="docs-meta">版本：{formatDateTime(currentVersion.createdAt)}</div>
              <MarkdownBody content={currentVersion.content} />
            </main>
          </div>
        </>
      ) : (
        <main className="docs-empty">
          <h1>{project.name}</h1>
          <p>这个项目还没有上传文档版本。</p>
        </main>
      )}
    </div>
  );
}

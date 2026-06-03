import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DocsToc } from "@/components/docs-toc";
import { DocsProjectSwitcher } from "@/components/docs-project-switcher";
import { DocsSidebarResizer } from "@/components/docs-sidebar-resizer";
import { DocsSearch } from "@/components/docs-search";
import { MarkdownBody } from "@/components/markdown-body";
import { SettingsMenu } from "@/components/settings-menu";
import { VersionSelect } from "@/components/version-select";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProjectWithVersionsByShareToken } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { localizedPath } from "@/lib/locales";
import { extractToc } from "@/lib/markdown";
import { getMessages } from "@/lib/messages";
import { resolveLocale } from "@/lib/page-locale";

type DocsPageProps = {
  params: Promise<{
    locale: string;
    token: string;
  }>;
  searchParams: Promise<{
    version?: string;
  }>;
};

export default async function DocsPage({ params, searchParams }: DocsPageProps) {
  const { locale: localeParam, token } = await params;
  const locale = resolveLocale(localeParam);
  const t = getMessages(locale);
  const { version } = await searchParams;
  const isAdmin = await isAdminAuthenticated();
  const project = getProjectWithVersionsByShareToken(token);

  if (!project) {
    notFound();
  }

  if (version && !project.allowPublicVersionHistory) {
    redirect(localizedPath(locale, `/docs/${token}`));
  }

  const currentVersion = project.allowPublicVersionHistory && version
    ? project.versions.find((item) => item.id === Number(version))
    : project.versions[0];

  if (version && !currentVersion) {
    notFound();
  }

  const tocItems = currentVersion ? extractToc(currentVersion.content) : [];

  return (
    <div className="docs-page">
      <header className="docs-header">
        <div className="docs-title">
          <div className="docs-breadcrumb">
            {isAdmin ? (
              <Link className="docs-breadcrumb-link" href={localizedPath(locale, "/admin/projects")}>
                {t.admin.projects.title}
              </Link>
            ) : (
              <span className="docs-breadcrumb-brand">MarkAPI</span>
            )}
            <span aria-hidden="true" className="docs-breadcrumb-separator">/</span>
            <DocsProjectSwitcher
              key={project.shareToken}
              labels={{
                cancel: t.common.cancel,
                current: t.common.current,
                delete: t.common.delete,
                deleteRecord: t.docs.projectSwitcher.deleteRecord,
                deleteRecordQuestion: t.docs.projectSwitcher.deleteRecordQuestion,
                opening: t.docs.projectSwitcher.opening,
                switchProject: t.docs.projectSwitcher.switchProject
              }}
              locale={locale}
              currentProject={{
                token: project.shareToken,
                name: project.name
              }}
            />
          </div>
        </div>
        {currentVersion ? <DocsSearch key={`search-${currentVersion.id}`} labels={t.docs.search} /> : null}
        <div className="docs-header-controls">
          {currentVersion && project.allowPublicVersionHistory ? (
            <VersionSelect
              key={currentVersion.id}
              currentVersionId={currentVersion.id}
              labels={{
                loading: t.common.loading,
                selectVersion: t.docs.selectVersion,
                switchVersion: t.docs.switchVersion,
                version: t.docs.version
              }}
              locale={locale}
              token={project.shareToken}
              versions={project.versions.map((item) => ({
                id: item.id,
                label: formatDateTime(item.createdAt, locale)
              }))}
            />
          ) : null}
          <SettingsMenu
            labels={{
              locale: t.components.locale,
              settings: t.components.settings,
              theme: t.components.theme
            }}
            locale={locale}
          />
        </div>
      </header>

      {currentVersion ? (
        <>
          <div className="mobile-toc">
            <details>
              <summary>{t.docs.toc}</summary>
              <DocsToc
                items={tocItems}
                labels={{
                  compact: t.docs.tocCompact,
                  empty: t.docs.tocEmpty,
                  expand: t.docs.tocExpand,
                  title: t.docs.toc
                }}
              />
            </details>
          </div>
          <div className="docs-shell">
            <aside className="docs-sidebar">
              <DocsToc
                collapsible
                items={tocItems}
                labels={{
                  compact: t.docs.tocCompact,
                  empty: t.docs.tocEmpty,
                  expand: t.docs.tocExpand,
                  title: t.docs.toc
                }}
              />
            </aside>
            <DocsSidebarResizer label={t.docs.tocResize} projectToken={project.shareToken} />
            <main className="docs-content">
              <div className="docs-meta">{t.docs.version}: {formatDateTime(currentVersion.createdAt, locale)}</div>
              <MarkdownBody content={currentVersion.content} labels={t.components.copy} />
            </main>
          </div>
        </>
      ) : (
        <main className="docs-empty">
          <h1>{project.name}</h1>
          <p>{t.docs.emptyProject}</p>
        </main>
      )}
    </div>
  );
}

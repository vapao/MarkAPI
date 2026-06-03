import Link from "next/link";
import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth";
import { getProjectsWithLatestVersion } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { localizedPath } from "@/lib/locales";
import { getMessages } from "@/lib/messages";
import { resolveLocale } from "@/lib/page-locale";
import { getShareUrl } from "@/lib/url";

type ProjectsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = getMessages(locale);

  await requireAdmin(locale);

  const projects = getProjectsWithLatestVersion();

  const shareUrls = new Map(
    await Promise.all(
      projects.map(async (project) => [project.id, await getShareUrl(project.shareToken, locale)] as const)
    )
  );

  return (
    <div className="admin-page">
      <AdminHeader
        locale={locale}
        labels={{
          logout: t.admin.logout,
          locale: t.components.locale,
          settings: t.components.settings,
          theme: t.components.theme
        }}
        action={
          <Link className="button button-primary" href={localizedPath(locale, "/admin/projects/new")}>
            {t.admin.projects.newProject}
          </Link>
        }
      />
      <main className="admin-main">
        <section className="section-heading">
          <div>
            <h1>{t.admin.projects.title}</h1>
            <p>{t.admin.projects.description}</p>
          </div>
        </section>

        <div className="project-list">
          {projects.length > 0 ? (
            projects.map((project) => {
              const latestVersion = project.versions[0];

              return (
                <article className="project-row" key={project.id}>
                  <div>
                    <h2>{project.name}</h2>
                    <p>
                      {t.admin.projects.latestVersion}
                      {latestVersion ? formatDateTime(latestVersion.createdAt, locale) : t.admin.projects.noVersion}
                    </p>
                    <p className="share-text">{shareUrls.get(project.id)}</p>
                  </div>
                  <div className="row-actions">
                    <Link className="button button-secondary" href={localizedPath(locale, `/docs/${project.shareToken}`)}>
                      {t.common.view}
                    </Link>
                    <Link className="button button-primary" href={localizedPath(locale, `/admin/projects/${project.id}`)}>
                      {t.common.manage}
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <section className="panel">
              <p className="empty-text">{t.admin.projects.empty}</p>
              <Link className="button button-primary" href={localizedPath(locale, "/admin/projects/new")}>
                {t.admin.projects.newProject}
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

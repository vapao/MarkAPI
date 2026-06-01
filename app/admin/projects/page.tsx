import Link from "next/link";
import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getShareUrl } from "@/lib/url";

export default async function ProjectsPage() {
  await requireAdmin();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  const shareUrls = new Map(
    await Promise.all(
      projects.map(async (project) => [project.id, await getShareUrl(project.shareToken)] as const)
    )
  );

  return (
    <div className="admin-page">
      <AdminHeader
        action={
          <Link className="button button-primary" href="/admin/projects/new">
            新建项目
          </Link>
        }
      />
      <main className="admin-main">
        <section className="section-heading">
          <div>
            <h1>项目列表</h1>
            <p>上传完整 Markdown 文档后，分享链接会展示最新版本。</p>
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
                      最新版本：
                      {latestVersion ? formatDateTime(latestVersion.createdAt) : "暂无版本"}
                    </p>
                    <p className="share-text">{shareUrls.get(project.id)}</p>
                  </div>
                  <div className="row-actions">
                    <Link className="button button-secondary" href={`/docs/${project.shareToken}`}>
                      查看
                    </Link>
                    <Link className="button button-primary" href={`/admin/projects/${project.id}`}>
                      上传
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <section className="panel">
              <p className="empty-text">还没有项目。</p>
              <Link className="button button-primary" href="/admin/projects/new">
                新建项目
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

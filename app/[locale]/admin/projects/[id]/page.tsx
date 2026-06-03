import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { ProjectDetail } from "@/components/project-detail";
import { requireAdmin } from "@/lib/auth";
import { getAdminErrorMessage, getMessages } from "@/lib/messages";
import { resolveLocale } from "@/lib/page-locale";
import { prisma } from "@/lib/prisma";
import { getShareUrl } from "@/lib/url";

type ProjectPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { locale: localeParam, id } = await params;
  const locale = resolveLocale(localeParam);
  const t = getMessages(locale);

  await requireAdmin(locale);

  const projectId = Number(id);

  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      versions: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const { error } = await searchParams;
  const errorMessage = getAdminErrorMessage(locale, error);

  return (
    <div className="admin-page">
      <AdminHeader
        locale={locale}
        title={`MarkAPI / ${project.name}`}
        labels={{
          locale: t.components.locale,
          logout: t.admin.logout,
          settings: t.components.settings,
          theme: t.components.theme
        }}
      />
      <ProjectDetail
        error={errorMessage}
        labels={{
          common: t.common,
          copy: t.components.copy,
          file: t.components.file,
          project: t.admin.project
        }}
        locale={locale}
        project={project}
        shareUrl={await getShareUrl(project.shareToken, locale)}
      />
    </div>
  );
}

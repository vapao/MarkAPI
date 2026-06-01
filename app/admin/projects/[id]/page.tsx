import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { ProjectDetail } from "@/components/project-detail";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShareUrl } from "@/lib/url";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  await requireAdmin();

  const { id } = await params;
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

  return (
    <div className="admin-page">
      <AdminHeader title={`Dmark / ${project.name}`} />
      <ProjectDetail project={project} shareUrl={await getShareUrl(project.shareToken)} error={error} />
    </div>
  );
}

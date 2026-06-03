import type { DocumentVersion, Project } from "@prisma/client";
import Link from "next/link";
import { updateProjectPublicAccessAction, uploadVersionAction } from "@/app/admin/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import { MarkdownFileField } from "@/components/markdown-file-field";
import { ProjectPublicAccessForm } from "@/components/project-public-access-form";
import { formatDateTime } from "@/lib/format";
import { localizedPath, type Locale } from "@/lib/locales";
import type { Messages } from "@/lib/messages";

type ProjectDetailProps = {
  labels: {
    common: Messages["common"];
    copy: Messages["components"]["copy"];
    file: Messages["components"]["file"];
    project: Messages["admin"]["project"];
  };
  locale: Locale;
  project: Project & {
    versions: DocumentVersion[];
  };
  shareUrl: string;
  error?: string;
};

export function ProjectDetail({ labels, locale, project, shareUrl, error }: ProjectDetailProps) {
  const uploadAction = uploadVersionAction.bind(null, project.id);
  const updatePublicAccessAction = updateProjectPublicAccessAction.bind(null, project.id);

  return (
    <main className="admin-main">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h1>{project.name}</h1>
            <p>{labels.project.slug}{project.slug}</p>
          </div>
          <Link className="button button-ghost" href={localizedPath(locale, "/admin/projects")}>
            {labels.common.backToProjects}
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>{labels.project.publicAccess}</h2>
        <div className="public-access-share">
          <h3>{labels.project.shareLink}</h3>
          <div className="share-row">
            <input readOnly value={shareUrl} aria-label={labels.project.shareLinkLabel} />
            <CopyLinkButton labels={labels.copy} value={shareUrl} />
          </div>
          <p className="muted">{labels.project.shareHelp}</p>
        </div>
        <ProjectPublicAccessForm
          action={updatePublicAccessAction}
          checked={project.allowPublicVersionHistory}
          labels={{
            allowPublicVersionHistory: labels.project.allowPublicVersionHistory,
            allowPublicVersionHistoryHelp: labels.project.allowPublicVersionHistoryHelp
          }}
          locale={locale}
        />
      </section>

      <section className="panel" id="upload">
        <h2>{labels.project.uploadTitle}</h2>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="stack-form" action={uploadAction}>
          <input type="hidden" name="locale" value={locale} />
          <MarkdownFileField labels={labels.file} />
          <label>
            <span>{labels.project.note}</span>
            <textarea name="note" rows={4} placeholder={labels.project.notePlaceholder} />
          </label>
          <div>
            <button className="button button-primary" type="submit">
              {labels.project.uploadSubmit}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>{labels.project.history}</h2>
        {project.versions.length > 0 ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{labels.project.versionTime}</th>
                  <th>{labels.project.noteHeader}</th>
                  <th>{labels.project.action}</th>
                </tr>
              </thead>
              <tbody>
                {project.versions.map((version) => (
                  <tr key={version.id}>
                    <td>{formatDateTime(version.createdAt, locale)}</td>
                    <td>{version.note || labels.project.noNote}</td>
                    <td>
                      <Link href={`${localizedPath(locale, `/docs/${project.shareToken}`)}?version=${version.id}`}>
                        {labels.common.view}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-text">{labels.project.emptyVersions}</p>
        )}
      </section>
    </main>
  );
}

import type { DocumentVersion, Project } from "@prisma/client";
import Link from "next/link";
import { uploadVersionAction } from "@/app/admin/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import { MarkdownFileField } from "@/components/markdown-file-field";
import { formatDateTime } from "@/lib/format";

type ProjectDetailProps = {
  project: Project & {
    versions: DocumentVersion[];
  };
  shareUrl: string;
  error?: string;
};

export function ProjectDetail({ project, shareUrl, error }: ProjectDetailProps) {
  const uploadAction = uploadVersionAction.bind(null, project.id);

  return (
    <main className="admin-main">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h1>{project.name}</h1>
            <p>slug：{project.slug}</p>
          </div>
          <Link className="button button-ghost" href="/admin/projects">
            返回项目列表
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>分享链接</h2>
        <div className="share-row">
          <input readOnly value={shareUrl} aria-label="分享链接" />
          <CopyLinkButton value={shareUrl} />
        </div>
        <p className="muted">拥有该链接的用户可访问当前文档。</p>
      </section>

      <section className="panel" id="upload">
        <h2>上传新版本</h2>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="stack-form" action={uploadAction}>
          <MarkdownFileField />
          <label>
            <span>版本备注</span>
            <textarea name="note" rows={4} placeholder="本次更新的后台备注，可留空" />
          </label>
          <div>
            <button className="button button-primary" type="submit">
              上传新版本
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>历史版本</h2>
        {project.versions.length > 0 ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>版本时间</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {project.versions.map((version) => (
                  <tr key={version.id}>
                    <td>{formatDateTime(version.createdAt)}</td>
                    <td>{version.note || "无备注"}</td>
                    <td>
                      <Link href={`/docs/${project.shareToken}?version=${version.id}`}>
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-text">还没有上传文档版本。</p>
        )}
      </section>
    </main>
  );
}

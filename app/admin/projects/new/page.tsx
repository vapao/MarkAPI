import Link from "next/link";
import { createProjectAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth";

type NewProjectPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  await requireAdmin();

  const { error } = await searchParams;

  return (
    <div className="admin-page">
      <AdminHeader
        title="MarkAPI / 新建项目"
        action={
          <Link className="button button-ghost" href="/admin/projects">
            返回项目列表
          </Link>
        }
      />
      <main className="admin-main narrow">
        <section className="panel">
          <h1>新建项目</h1>
          {error ? <p className="form-error">{error}</p> : null}
          <form className="stack-form" action={createProjectAction}>
            <label>
              <span>项目名称</span>
              <input required type="text" name="name" placeholder="例如：智霖小程序端 API 文档" />
            </label>
            <div>
              <button className="button button-primary" type="submit">
                创建项目
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

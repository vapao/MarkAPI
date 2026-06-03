import Link from "next/link";
import { createProjectAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth";
import { localizedPath } from "@/lib/locales";
import { getAdminErrorMessage, getMessages } from "@/lib/messages";
import { resolveLocale } from "@/lib/page-locale";

type NewProjectPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewProjectPage({ params, searchParams }: NewProjectPageProps) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = getMessages(locale);

  await requireAdmin(locale);

  const { error } = await searchParams;
  const errorMessage = getAdminErrorMessage(locale, error);

  return (
    <div className="admin-page">
      <AdminHeader
        locale={locale}
        title={`MarkAPI / ${t.admin.newProject.title}`}
        labels={{
          logout: t.admin.logout,
          locale: t.components.locale,
          settings: t.components.settings,
          theme: t.components.theme
        }}
        action={
          <Link className="button button-ghost" href={localizedPath(locale, "/admin/projects")}>
            {t.common.backToProjects}
          </Link>
        }
      />
      <main className="admin-main narrow">
        <section className="panel">
          <h1>{t.admin.newProject.title}</h1>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <form className="stack-form" action={createProjectAction}>
            <input type="hidden" name="locale" value={locale} />
            <label>
              <span>{t.admin.newProject.name}</span>
              <input required type="text" name="name" placeholder={t.admin.newProject.namePlaceholder} />
            </label>
            <div>
              <button className="button button-primary" type="submit">
                {t.admin.newProject.submit}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { SettingsMenu } from "@/components/settings-menu";
import { isAdminAuthenticated } from "@/lib/auth";
import { localizedPath } from "@/lib/locales";
import { getAdminErrorMessage, getMessages } from "@/lib/messages";
import { resolveLocale } from "@/lib/page-locale";

type LoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = getMessages(locale);

  if (await isAdminAuthenticated()) {
    redirect(localizedPath(locale, "/admin/projects"));
  }

  const { error } = await searchParams;
  const errorMessage = getAdminErrorMessage(locale, error);

  return (
    <main className="login-page">
      <form className="login-card" action={loginAction}>
        <input type="hidden" name="locale" value={locale} />
        <div className="login-card-header">
          <div>
            <h1>MarkAPI</h1>
            <p>{t.common.markApiAdmin}</p>
          </div>
          <div className="login-card-controls">
            <SettingsMenu
              labels={{
                locale: t.components.locale,
                settings: t.components.settings,
                theme: t.components.theme
              }}
              locale={locale}
            />
          </div>
        </div>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          <span>{t.admin.login.password}</span>
          <input autoFocus required type="password" name="password" />
        </label>
        <button className="button button-primary" type="submit">
          {t.admin.login.submit}
        </button>
      </form>
    </main>
  );
}

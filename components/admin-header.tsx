import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { SettingsMenu } from "@/components/settings-menu";
import { localizedPath, type Locale } from "@/lib/locales";
import type { Messages } from "@/lib/messages";

type AdminHeaderProps = {
  title?: string;
  action?: React.ReactNode;
  labels: {
    locale: Messages["components"]["locale"];
    logout: string;
    settings: Messages["components"]["settings"];
    theme: Messages["components"]["theme"];
  };
  locale: Locale;
};

export function AdminHeader({ title = "MarkAPI", action, labels, locale }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <Link className="brand" href={localizedPath(locale, "/admin/projects")}>
          <span className="brand-mark">M</span>
          <span>{title}</span>
        </Link>
      </div>
      <div className="admin-header-actions">
        {action}
        <SettingsMenu
          labels={{
            locale: labels.locale,
            settings: labels.settings,
            theme: labels.theme
          }}
          locale={locale}
        >
          <form action={logoutAction} className="settings-menu-form">
            <input type="hidden" name="locale" value={locale} />
            <button className="settings-menu-option settings-menu-option-danger" role="menuitem" type="submit">
              <span className="settings-menu-option-label">
                <LogOut aria-hidden="true" size={15} strokeWidth={2.25} />
                <span>{labels.logout}</span>
              </span>
            </button>
          </form>
        </SettingsMenu>
      </div>
    </header>
  );
}

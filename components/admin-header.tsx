import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/theme-toggle";

type AdminHeaderProps = {
  title?: string;
  action?: React.ReactNode;
};

export function AdminHeader({ title = "MarkAPI", action }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <Link className="brand" href="/admin/projects">
          <span className="brand-mark">M</span>
          <span>{title}</span>
        </Link>
      </div>
      <div className="admin-header-actions">
        {action}
        <ThemeToggle />
        <form action={logoutAction}>
          <button className="button button-ghost" type="submit">
            退出登录
          </button>
        </form>
      </div>
    </header>
  );
}

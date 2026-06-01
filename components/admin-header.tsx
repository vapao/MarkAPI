import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

type AdminHeaderProps = {
  title?: string;
  action?: React.ReactNode;
};

export function AdminHeader({ title = "Dmark", action }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <Link className="brand" href="/admin/projects">
          <span className="brand-mark">D</span>
          <span>{title}</span>
        </Link>
      </div>
      <div className="admin-header-actions">
        {action}
        <form action={logoutAction}>
          <button className="button button-ghost" type="submit">
            退出登录
          </button>
        </form>
      </div>
    </header>
  );
}

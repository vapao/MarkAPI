import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin/projects");
  }

  const { error } = await searchParams;

  return (
    <main className="login-page">
      <form className="login-card" action={loginAction}>
        <div>
          <h1>Dmark</h1>
          <p>Markdown API 文档管理</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <label>
          <span>管理密码</span>
          <input autoFocus required type="password" name="password" />
        </label>
        <button className="button button-primary" type="submit">
          登录
        </button>
      </form>
    </main>
  );
}
